import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 503 });
  }
  const { data, error } = await supabase
    .from('voice_rooms')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch rooms error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch rooms' }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { name, description, language, maxParticipants } = await request.json();

  if (!name || !language) {
    return new Response(JSON.stringify({ error: 'Name and language are required' }), { status: 400 });
  }

  const supabase = locals.supabase;
  const { data, error } = await supabase
    .from('voice_rooms')
    .insert({
      name,
      description: description || null,
      language,
      max_participants: maxParticipants || 10,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create room error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create room' }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
