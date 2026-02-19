import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = locals.supabase;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { language, mode, textLevel, voiceLevel, feedback } = body;

  if (!language || !mode || !['english', 'japanese'].includes(language) || !['text', 'voice', 'both'].includes(mode)) {
    return new Response(JSON.stringify({ error: 'Invalid language or mode' }), { status: 400 });
  }

  const { data, error } = await supabase!
    .from('assessment_results')
    .insert({
      user_id: user.id,
      language,
      mode,
      text_level: textLevel || null,
      voice_level: voiceLevel || null,
      feedback: feedback || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Save assessment error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save assessment' }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
