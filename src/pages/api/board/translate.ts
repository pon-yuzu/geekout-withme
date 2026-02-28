import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { tryIncrementUsage, quotaExceededResponse } from '../../../lib/quota';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { source_type, source_id, target_language, text } = await request.json();

  if (!source_type || !source_id || !target_language || !text?.trim()) {
    return new Response(JSON.stringify({ error: 'source_type, source_id, target_language, and text are required' }), { status: 400 });
  }

  const runtime = (locals as any).runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const serviceClient = createClient(supabaseUrl, serviceKey);

  // Check cache first
  const { data: cached } = await serviceClient
    .from('board_translation_cache')
    .select('translated_text')
    .eq('source_id', source_id)
    .eq('source_type', source_type)
    .eq('target_language', target_language)
    .maybeSingle();

  if (cached) {
    return new Response(JSON.stringify({ translated_text: cached.translated_text, from_cache: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // New translation — check quota
  const quotaResult = await tryIncrementUsage(locals, 'translation');
  if (!quotaResult.allowed) {
    return quotaExceededResponse('translation');
  }

  // Translate using Workers AI
  const ai = runtime?.env?.AI;
  if (!ai) {
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { status: 503 });
  }

  const langName = target_language === 'ja' ? 'Japanese' : 'English';

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a translator. Translate the user's text to ${langName}. Output ONLY the translation, nothing else.`,
        },
        { role: 'user', content: text.trim() },
      ],
      max_tokens: 1024,
    });

    const translatedText = (result as any)?.response?.trim() || '';

    if (translatedText) {
      // Save to cache (ignore errors)
      await serviceClient
        .from('board_translation_cache')
        .insert({
          source_type,
          source_id,
          target_language,
          translated_text: translatedText,
        })
        .then(() => {})
        .catch(() => {});
    }

    return new Response(JSON.stringify({ translated_text: translatedText, from_cache: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Translation failed' }), { status: 502 });
  }
};
