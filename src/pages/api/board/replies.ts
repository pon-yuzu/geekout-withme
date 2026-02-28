import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { thread_id, body } = await request.json();

  if (!thread_id || !body?.trim()) {
    return new Response(JSON.stringify({ error: 'thread_id and body are required' }), { status: 400 });
  }

  if (body.trim().length > 5000) {
    return new Response(JSON.stringify({ error: 'Body must be 5000 characters or less' }), { status: 400 });
  }

  const supabase = locals.supabase!;

  // Verify thread exists
  const { data: thread } = await supabase
    .from('threads')
    .select('id')
    .eq('id', thread_id)
    .single();

  if (!thread) {
    return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404 });
  }

  const { data: reply, error } = await supabase
    .from('replies')
    .insert({
      thread_id,
      author_id: user.id,
      body: body.trim(),
    })
    .select(`
      id, body, like_count, created_at,
      author:profiles!replies_author_id_fkey(id, display_name, avatar_url)
    `)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to create reply' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ...reply, user_liked: false }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
