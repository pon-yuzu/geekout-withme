import type { APIRoute } from 'astro';
import { verifyPassword } from '../../../lib/board-password';
import { getServiceClient } from '../../../lib/booking/db';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { board_id, password } = body;
  if (!board_id || !password) {
    return new Response(JSON.stringify({ error: 'board_id and password required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data: board } = await serviceClient
    .from('boards')
    .select('id, password_hash')
    .eq('id', board_id)
    .single();

  if (!board) {
    return new Response(JSON.stringify({ error: 'Board not found' }), { status: 404 });
  }

  if (!board.password_hash) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const isValid = await verifyPassword(password, board.password_hash);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
  }

  await serviceClient.from('board_unlocks').upsert(
    { user_id: user.id, board_id },
    { onConflict: 'user_id,board_id' }
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
