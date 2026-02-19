import type { APIRoute } from 'astro';

// Map assessment levels to workbook levels
const LEVEL_MAP: Record<string, string> = {
  // CEFR (English)
  A1: 'eiken5',
  A2: 'eiken4',
  B1: 'eiken3',
  B2: 'toeic400',
  C1: 'toeic600',
  // JLPT (Japanese → mapped to English workbook level)
  N5: 'eiken5',
  N4: 'eiken4',
  N3: 'eiken3',
  N2: 'toeic400',
  N1: 'toeic600',
};

const LEVEL_LABELS: Record<string, string> = {
  eiken5: '英検5級（中1程度）',
  eiken4: '英検4級（中2程度）',
  eiken3: '英検3級（中3程度）',
  toeic400: 'TOEIC 400点レベル',
  toeic600: 'TOEIC 600点レベル',
};

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const supabase = locals.supabase!;

  // Get most recent English assessment
  const { data: assessment } = await supabase
    .from('assessment_results')
    .select('text_level, voice_level, language')
    .eq('user_id', user.id)
    .eq('language', 'english')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    return new Response(JSON.stringify({ level: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use the highest assessed level
  const textLevel = assessment.text_level as string | null;
  const voiceLevel = assessment.voice_level as string | null;
  const bestLevel = textLevel ?? voiceLevel;

  if (!bestLevel) {
    return new Response(JSON.stringify({ level: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mappedLevel = LEVEL_MAP[bestLevel];
  const label = mappedLevel ? LEVEL_LABELS[mappedLevel] : null;

  return new Response(
    JSON.stringify({
      level: mappedLevel ?? null,
      label: label ?? null,
      assessedLevel: bestLevel,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
