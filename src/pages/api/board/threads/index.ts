import type { APIRoute } from 'astro';
import { isAdmin } from '../../../../lib/admin';

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const boardId = url.searchParams.get('board_id');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = 20;

  if (!boardId) {
    return new Response(JSON.stringify({ error: 'board_id is required' }), { status: 400 });
  }

  const supabase = locals.supabase!;
  const offset = (page - 1) * perPage;

  const { data: threads, error } = await supabase
    .from('threads')
    .select(`
      id, title, body, like_count, reply_count, created_at, updated_at,
      author:profiles!threads_author_id_fkey(id, display_name, avatar_url)
    `)
    .eq('board_id', boardId)
    .order('updated_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch threads' }), { status: 500 });
  }

  // Check if user liked any of these threads
  const threadIds = (threads || []).map((t: any) => t.id);
  let userLikes: Set<string> = new Set();
  if (threadIds.length > 0) {
    const { data: likes } = await supabase
      .from('board_likes')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('target_type', 'thread')
      .in('target_id', threadIds);
    userLikes = new Set((likes || []).map((l: any) => l.target_id));
  }

  const result = (threads || []).map((t: any) => ({
    ...t,
    user_liked: userLikes.has(t.id),
  }));

  return new Response(JSON.stringify({ threads: result, page, perPage }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { board_id, title, body } = await request.json();

  if (!board_id || !title?.trim() || !body?.trim()) {
    return new Response(JSON.stringify({ error: 'board_id, title, and body are required' }), { status: 400 });
  }

  if (title.trim().length > 100) {
    return new Response(JSON.stringify({ error: 'Title must be 100 characters or less' }), { status: 400 });
  }

  if (body.trim().length > 5000) {
    return new Response(JSON.stringify({ error: 'Body must be 5000 characters or less' }), { status: 400 });
  }

  const supabase = locals.supabase!;

  // Check board exists and permission
  const { data: board } = await supabase
    .from('boards')
    .select('id, post_permission')
    .eq('id', board_id)
    .single();

  if (!board) {
    return new Response(JSON.stringify({ error: 'Board not found' }), { status: 404 });
  }

  if (board.post_permission === 'admin_only' && !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Only admins can post in this board' }), { status: 403 });
  }

  const { data: thread, error } = await supabase
    .from('threads')
    .insert({
      board_id,
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to create thread' }), { status: 500 });
  }

  return new Response(JSON.stringify(thread), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
