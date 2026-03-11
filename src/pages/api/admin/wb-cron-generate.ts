import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { generateDay, extractJSON, validateDayContent, getAnthropicKey } from '../../../lib/anthropic';
import { buildSystemPrompt, buildContextPrompt, buildUserPrompt } from '../../../lib/adaptive-workbook/prompts';
import type { AdaptiveDayContent, StudentConfig } from '../../../lib/adaptive-workbook/types';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export const GET: APIRoute = async ({ url, locals }) => {
  const runtime = (locals as any).runtime;
  const cronSecret = runtime?.env?.CRON_SECRET || import.meta.env.CRON_SECRET;
  const providedSecret = url.searchParams.get('secret') || '';

  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server config error' }), { status: 500 });
  }

  const apiKey = getAnthropicKey(locals);
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 });
  }

  const { data: configs } = await supabase
    .from('student_configs')
    .select('*')
    .in('generation_mode', ['weekly', 'daily'])
    .eq('status', 'generating');

  if (!configs || configs.length === 0) {
    return new Response(JSON.stringify({ ok: true, message: 'No configs to generate', generated: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results: { config_id: string; day_number: number; status: string; error?: string }[] = [];

  for (const config of configs) {
    if (config.days_completed >= config.total_days) {
      await supabase
        .from('student_configs')
        .update({ status: 'review', updated_at: new Date().toISOString() })
        .eq('id', config.id);
      continue;
    }

    const daysToGenerate = config.generation_mode === 'weekly' ? 7 : 1;
    const endDay = Math.min(config.days_completed + daysToGenerate, config.total_days);
    const studentConfig = config.config_json as StudentConfig;
    const systemPrompt = buildSystemPrompt(studentConfig.target_language || 'english');
    const contextPrompt = buildContextPrompt(studentConfig);

    for (let dayNum = config.days_completed + 1; dayNum <= endDay; dayNum++) {
      try {
        const userPrompt = buildUserPrompt(dayNum, config.total_days, studentConfig, config.adjustment_notes || undefined);
        const response = await generateDay({ systemPrompt, contextPrompt, userPrompt, apiKey });
        const content = extractJSON<AdaptiveDayContent>(response);
        const errors = validateDayContent(content);
        if (errors.length > 0) throw new Error(`Invalid: ${errors.join(', ')}`);

        await supabase.from('adaptive_workbook_days').upsert({
          config_id: config.id,
          day_number: dayNum,
          content_json: content,
          review_status: 'pending',
          generated_at: new Date().toISOString(),
        }, { onConflict: 'config_id,day_number' });

        results.push({ config_id: config.id, day_number: dayNum, status: 'ok' });
      } catch (err: any) {
        results.push({ config_id: config.id, day_number: dayNum, status: 'error', error: import.meta.env.DEV ? err.message : 'Generation error' });
        break;
      }
    }

    const newCompleted = Math.max(
      config.days_completed,
      ...results.filter((r) => r.config_id === config.id && r.status === 'ok').map((r) => r.day_number)
    );
    const isComplete = newCompleted >= config.total_days;

    await supabase
      .from('student_configs')
      .update({
        days_completed: newCompleted,
        status: isComplete ? 'review' : 'generating',
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);
  }

  return new Response(JSON.stringify({
    ok: true,
    timestamp: new Date().toISOString(),
    generated: results,
  }), { headers: { 'Content-Type': 'application/json' } });
};
