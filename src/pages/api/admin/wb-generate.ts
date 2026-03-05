import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';
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

// POST: Start generation for a config
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const apiKey = getAnthropicKey(locals);
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 });
  }

  const body = await request.json();
  const { config_id } = body;

  if (!config_id) {
    return new Response(JSON.stringify({ error: 'Missing config_id' }), { status: 400 });
  }

  // Fetch config
  const { data: config, error: configError } = await supabase
    .from('student_configs')
    .select('*')
    .eq('id', config_id)
    .single();

  if (configError || !config) {
    return new Response(JSON.stringify({ error: 'Config not found' }), { status: 404 });
  }

  if (config.status === 'generating') {
    return new Response(JSON.stringify({
      status: 'generating',
      days_completed: config.days_completed,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Set status to generating
  await supabase
    .from('student_configs')
    .update({ status: 'generating', days_completed: 0, updated_at: new Date().toISOString() })
    .eq('id', config_id);

  // Clear any existing days for regeneration
  await supabase
    .from('adaptive_workbook_days')
    .delete()
    .eq('config_id', config_id);

  // Generate Day 1 immediately
  const studentConfig = config.config_json as StudentConfig;
  const systemPrompt = buildSystemPrompt(studentConfig.target_language || 'english');
  const contextPrompt = buildContextPrompt(studentConfig);
  const userPrompt = buildUserPrompt(1, config.total_days, studentConfig);

  try {
    const response = await generateDay({
      systemPrompt,
      contextPrompt,
      userPrompt,
      apiKey,
    });

    const content = extractJSON<AdaptiveDayContent>(response);

    const validationErrors = validateDayContent(content);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid content: ${validationErrors.join(', ')}`);
    }

    // Save Day 1
    await supabase.from('adaptive_workbook_days').insert({
      config_id,
      day_number: 1,
      content_json: content,
      review_status: 'pending',
      generated_at: new Date().toISOString(),
    });

    // Update progress
    await supabase
      .from('student_configs')
      .update({ days_completed: 1, updated_at: new Date().toISOString() })
      .eq('id', config_id);

    return new Response(JSON.stringify({
      status: 'generating',
      days_completed: 1,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // Reset status on failure
    await supabase
      .from('student_configs')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', config_id);

    return new Response(JSON.stringify({ error: `Generation failed: ${err.message}` }), { status: 500 });
  }
};
