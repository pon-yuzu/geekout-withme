import type { APIRoute } from 'astro';
import { tryIncrementUsage, quotaExceededResponse } from '../../lib/quota';
import { isVoiceLoungeAllowed } from '../../lib/features';
import { getUserTier } from '../../lib/tier';

const MAX_TEXT_LENGTH = 500;
const JA_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isVoiceLoungeAllowed(locals.user?.id, locals)) {
    return new Response(JSON.stringify({ error: 'Voice Lounge is currently under maintenance' }), { status: 503 });
  }
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Premium check
  const supabase = locals.supabase!;
  const tier = await getUserTier(supabase, user.id);
  if (tier === 'free') {
    return new Response(JSON.stringify({ error: 'Premium required' }), { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > MAX_TEXT_LENGTH) {
    return new Response(JSON.stringify({ error: 'Invalid text (empty or exceeds 500 chars)' }), { status: 400 });
  }

  const originalLang = JA_REGEX.test(text) ? 'ja' : 'en';
  const targetLang = originalLang === 'ja' ? 'English' : 'Japanese';

  // Daily quota check
  const quotaResult = await tryIncrementUsage(locals, 'translation');
  if (!quotaResult.allowed) {
    return quotaExceededResponse('translation');
  }

  const runtime = (locals as any).runtime;
  const ai = runtime?.env?.AI;

  if (!ai) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { status: 503 });
  }

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a translator. Translate the user's text to ${targetLang}. Output ONLY the translation, nothing else. Keep the tone casual and natural.`,
        },
        { role: 'user', content: text.trim() },
      ],
      max_tokens: 512,
    });

    const translatedText = (result as any)?.response?.trim() || '';
    if (!translatedText) {
      return new Response(JSON.stringify({ error: 'Translation failed' }), { status: 502 });
    }

    return new Response(JSON.stringify({ translatedText, originalLang }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Translation error:', err);
    return new Response(JSON.stringify({ error: 'Translation failed' }), { status: 502 });
  }
};
