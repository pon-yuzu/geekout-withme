import type { APIRoute } from 'astro';
import { analyze, buildTextAnalysisPrompt, extractJSON } from '../../lib/claude';

const MONTHLY_LIMIT = 1;

async function hasRecentAssessment(supabase: any, userId: string): Promise<boolean> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('assessment_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo);
  return (count ?? 0) >= MONTHLY_LIMIT;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { language, level, answers, assessmentType, uiLang } = body;

  if (!language || !level || typeof language !== 'string' || typeof level !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['english', 'japanese'].includes(language)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), { status: 400 });
  }

  if (!Array.isArray(answers)) {
    return new Response(JSON.stringify({ error: 'answers must be an array' }), { status: 400 });
  }

  // Determine AI backend: Claude for logged-in within rate limit, Workers AI otherwise
  let useClaudeApi = false;
  const runtime = (locals as any).runtime;
  const claudeApiKey = runtime?.env?.CF_AI_TOKEN || import.meta.env.CF_AI_TOKEN;

  if (user && claudeApiKey) {
    const exceeded = await hasRecentAssessment(locals.supabase!, user.id);
    if (!exceeded) {
      useClaudeApi = true;
    }
  }

  try {
    const systemPrompt = buildTextAnalysisPrompt(language, uiLang);
    const typeLabel = assessmentType === 'listening' ? 'listening' : 'reading/writing';
    const userMessage = `The learner completed the ${typeLabel} assessment at level ${level}. Their answer history: ${JSON.stringify(answers)}. Provide feedback.`;

    const result = await analyze({
      ai: runtime?.env?.AI,
      claudeApiKey: useClaudeApi ? claudeApiKey : undefined,
      systemPrompt,
      userMessage,
    });

    let analysis;
    try {
      analysis = extractJSON(result);
    } catch {
      analysis = { feedback: result, studyTips: [], focusAreas: [] };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), { status: 500 });
  }
};
