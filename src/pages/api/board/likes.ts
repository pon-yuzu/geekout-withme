import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { target_type, target_id } = await request.json();

  if (!target_type || !target_id) {
    return new Response(JSON.stringify({ error: 'target_type and target_id are required' }), { status: 400 });
  }

  if (!['thread', 'reply'].includes(target_type)) {
    return new Response(JSON.stringify({ error: 'target_type must be thread or reply' }), { status: 400 });
  }

  const supabase = locals.supabase!;

  // Check if already liked
  const { data: existing } = await supabase
    .from('board_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .maybeSingle();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('board_likes')
      .delete()
      .eq('id', existing.id);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to unlike' }), { status: 500 });
    }

    return new Response(JSON.stringify({ liked: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Like
    const { error } = await supabase
      .from('board_likes')
      .insert({
        user_id: user.id,
        target_type,
        target_id,
      });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to like' }), { status: 500 });
    }

    return new Response(JSON.stringify({ liked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
