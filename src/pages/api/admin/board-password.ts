import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';
import { hashPassword } from '../../../lib/board-password';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data: boards } = await supabase
    .from('boards')
    .select('id, name_ja, slug, password_hash')
    .order('sort_order');

  const result = (boards || []).map((b: any) => ({
    id: b.id,
    name_ja: b.name_ja,
    slug: b.slug,
    has_password: !!b.password_hash,
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { board_id, password } = body;
  if (!board_id) {
    return new Response(JSON.stringify({ error: 'board_id required' }), { status: 400 });
  }

  if (!password || password.trim() === '') {
    await supabase.from('boards').update({ password_hash: null }).eq('id', board_id);
  } else {
    const hash = await hashPassword(password);
    await supabase.from('boards').update({ password_hash: hash }).eq('id', board_id);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
