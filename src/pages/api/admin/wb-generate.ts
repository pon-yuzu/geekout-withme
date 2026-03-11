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

// POST: Generate Day 1 only → status becomes 'preview'
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

  // Set status to generating temporarily
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
  const adjustmentNotes = config.adjustment_notes || undefined;
  const systemPrompt = buildSystemPrompt(studentConfig.target_language || 'english');
  const contextPrompt = buildContextPrompt(studentConfig);
  const userPrompt = buildUserPrompt(1, config.total_days, studentConfig, adjustmentNotes);

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

    // Set status to 'preview' — pause here for admin review of Day 1
    await supabase
      .from('student_configs')
      .update({ days_completed: 1, status: 'preview', updated_at: new Date().toISOString() })
      .eq('id', config_id);

    return new Response(JSON.stringify({
      status: 'preview',
      days_completed: 1,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // Reset status on failure
    await supabase
      .from('student_configs')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', config_id);

    console.error('WB generation error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? `Generation failed: ${err.message}` : 'Generation failed' }), { status: 500 });
  }
};

// PUT: Continue generation (Day 2+) after preview approval
export const PUT: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const body = await request.json();
  const { config_id } = body;

  if (!config_id) {
    return new Response(JSON.stringify({ error: 'Missing config_id' }), { status: 400 });
  }

  const { data: config, error: configError } = await supabase
    .from('student_configs')
    .select('*')
    .eq('id', config_id)
    .single();

  if (configError || !config) {
    return new Response(JSON.stringify({ error: 'Config not found' }), { status: 404 });
  }

  if (config.status !== 'preview') {
    return new Response(JSON.stringify({ error: `Cannot continue: status is '${config.status}', expected 'preview'` }), { status: 400 });
  }

  // Switch to generating — polling will pick up Day 2+
  await supabase
    .from('student_configs')
    .update({ status: 'generating', updated_at: new Date().toISOString() })
    .eq('id', config_id);

  return new Response(JSON.stringify({
    status: 'generating',
    days_completed: config.days_completed,
    total_days: config.total_days,
  }), { headers: { 'Content-Type': 'application/json' } });
};
