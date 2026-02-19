import type { APIRoute } from 'astro';
import { analyze, buildTextAnalysisPrompt } from '../../lib/claude';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { language, level, answers } = body;

  if (!language || !level || typeof language !== 'string' || typeof level !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['english', 'japanese'].includes(language)) {
    return new Response(JSON.stringify({ error: 'Invalid language' }), { status: 400 });
  }

  if (!Array.isArray(answers)) {
    return new Response(JSON.stringify({ error: 'answers must be an array' }), { status: 400 });
  }

  try {
    const systemPrompt = buildTextAnalysisPrompt(language);
    const userMessage = `The learner completed the assessment at level ${level}. Their answer history: ${JSON.stringify(answers)}. Provide feedback.`;

    const result = await analyze({
      ai: (locals as any).runtime?.env?.AI,
      claudeApiKey: import.meta.env.CLAUDE_API_KEY,
      systemPrompt,
      userMessage,
    });

    let analysis;
    try {
      analysis = JSON.parse(result);
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
