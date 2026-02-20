import type { APIRoute } from 'astro';
import { analyze, buildVoiceAnalysisPrompt } from '../../lib/claude';

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

  const { transcript, language, level } = body;

  if (!transcript || !language || !level || typeof transcript !== 'string' || typeof language !== 'string' || typeof level !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['english', 'japanese'].includes(language)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), { status: 400 });
  }

  // Determine AI backend: Claude for logged-in within rate limit, Workers AI otherwise
  let useClaudeApi = false;
  let rateLimited = false;
  if (user && import.meta.env.CLAUDE_API_KEY) {
    const exceeded = await hasRecentAssessment(locals.supabase!, user.id);
    if (!exceeded) {
      useClaudeApi = true;
    } else {
      rateLimited = true;
    }
  }

  try {
    const systemPrompt = buildVoiceAnalysisPrompt(language, level);
    const result = await analyze({
      ai: (locals as any).runtime?.env?.AI,
      claudeApiKey: useClaudeApi ? import.meta.env.CLAUDE_API_KEY : undefined,
      systemPrompt,
      userMessage: `Spoken response transcript: "${transcript}"`,
    });

    let analysis;
    try {
      analysis = JSON.parse(result);
    } catch {
      analysis = { assessedLevel: level, passed: false, feedback: result, strengths: [], improvements: [] };
    }

    // Include metadata about which backend was used
    analysis.aiBackend = useClaudeApi ? 'claude' : 'workers';
    if (rateLimited) analysis.rateLimited = true;

    return new Response(JSON.stringify(analysis), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), { status: 500 });
  }
};
