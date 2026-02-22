import type { APIRoute } from 'astro';

// Map assessment levels to English workbook levels
const ENGLISH_LEVEL_MAP: Record<string, string> = {
  A1: 'eiken5',
  A2: 'eiken4',
  B1: 'eiken3',
  B2: 'toeic400',
  C1: 'toeic600',
  N5: 'eiken5',
  N4: 'eiken4',
  N3: 'eiken3',
  N2: 'toeic400',
  N1: 'toeic600',
};

const ENGLISH_LEVEL_LABELS: Record<string, string> = {
  eiken5: '英検5級（中1程度）',
  eiken4: '英検4級（中2程度）',
  eiken3: '英検3級（中3程度）',
  toeic400: 'TOEIC 400点レベル',
  toeic600: 'TOEIC 600点レベル',
};

// Map assessment levels to Japanese workbook levels
const JAPANESE_LEVEL_MAP: Record<string, string> = {
  N5: 'jlpt_n5',
  N4: 'jlpt_n4',
  N3: 'jlpt_n3',
  N2: 'jlpt_n2',
  N1: 'jlpt_n1',
  A1: 'jlpt_n5',
  A2: 'jlpt_n4',
  B1: 'jlpt_n3',
  B2: 'jlpt_n2',
  C1: 'jlpt_n1',
};

const JAPANESE_LEVEL_LABELS: Record<string, string> = {
  jlpt_n5: 'JLPT N5（入門）',
  jlpt_n4: 'JLPT N4（初級）',
  jlpt_n3: 'JLPT N3（中級）',
  jlpt_n2: 'JLPT N2（上級前半）',
  jlpt_n1: 'JLPT N1（上級）',
};

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const supabase = locals.supabase!;
  const language = url.searchParams.get('language') ?? 'english';

  // Get most recent assessment for the requested language
  const assessmentLanguage = language === 'japanese' ? 'japanese' : 'english';
  const { data: assessment } = await supabase
    .from('assessment_results')
    .select('text_level, voice_level, language')
    .eq('user_id', user.id)
    .eq('language', assessmentLanguage)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    return new Response(JSON.stringify({ level: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const textLevel = assessment.text_level as string | null;
  const voiceLevel = assessment.voice_level as string | null;
  const bestLevel = textLevel ?? voiceLevel;

  if (!bestLevel) {
    return new Response(JSON.stringify({ level: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const levelMap = language === 'japanese' ? JAPANESE_LEVEL_MAP : ENGLISH_LEVEL_MAP;
  const levelLabels = language === 'japanese' ? JAPANESE_LEVEL_LABELS : ENGLISH_LEVEL_LABELS;

  const mappedLevel = levelMap[bestLevel];
  const label = mappedLevel ? levelLabels[mappedLevel] : null;

  return new Response(
    JSON.stringify({
      level: mappedLevel ?? null,
      label: label ?? null,
      assessedLevel: bestLevel,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
