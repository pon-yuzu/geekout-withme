import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const threadId = params.id;
  if (!threadId) {
    return new Response(JSON.stringify({ error: 'Thread ID is required' }), { status: 400 });
  }

  const supabase = locals.supabase!;

  // Fetch thread with author profile
  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select(`
      id, board_id, title, body, like_count, reply_count, created_at, updated_at,
      author:profiles!threads_author_id_fkey(id, display_name, avatar_url)
    `)
    .eq('id', threadId)
    .single();

  if (threadError || !thread) {
    return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404 });
  }

  // Fetch replies with author profiles
  const { data: replies } = await supabase
    .from('replies')
    .select(`
      id, body, like_count, created_at,
      author:profiles!replies_author_id_fkey(id, display_name, avatar_url)
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  // Check user likes for thread and replies
  const allIds = [thread.id, ...(replies || []).map((r: any) => r.id)];
  const { data: likes } = await supabase
    .from('board_likes')
    .select('target_type, target_id')
    .eq('user_id', user.id)
    .in('target_id', allIds);

  const likedSet = new Set((likes || []).map((l: any) => `${l.target_type}:${l.target_id}`));

  return new Response(JSON.stringify({
    thread: { ...thread, user_liked: likedSet.has(`thread:${thread.id}`) },
    replies: (replies || []).map((r: any) => ({
      ...r,
      user_liked: likedSet.has(`reply:${r.id}`),
    })),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
