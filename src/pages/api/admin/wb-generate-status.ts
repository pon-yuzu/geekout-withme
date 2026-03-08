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

// GET: Check generation status and generate next day if needed
export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const configId = url.searchParams.get('configId');
  if (!configId) {
    return new Response(JSON.stringify({ error: 'Missing configId' }), { status: 400 });
  }

  const { data: config, error: configError } = await supabase
    .from('student_configs')
    .select('*')
    .eq('id', configId)
    .single();

  if (configError || !config) {
    return new Response(JSON.stringify({ error: 'Config not found' }), { status: 404 });
  }

  // Already completed all days
  if (config.days_completed >= config.total_days) {
    // Move to review status if still generating
    if (config.status === 'generating') {
      await supabase
        .from('student_configs')
        .update({ status: 'review', updated_at: new Date().toISOString() })
        .eq('id', configId);
    }

    return new Response(JSON.stringify({
      status: 'review',
      days_completed: config.days_completed,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Not in generating status
  if (config.status !== 'generating') {
    return new Response(JSON.stringify({
      status: config.status,
      days_completed: config.days_completed,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Generate next day
  const apiKey = getAnthropicKey(locals);
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 });
  }

  const nextDay = config.days_completed + 1;
  const studentConfig = config.config_json as StudentConfig;
  const systemPrompt = buildSystemPrompt(studentConfig.target_language || 'english');
  const contextPrompt = buildContextPrompt(studentConfig);
  const userPrompt = buildUserPrompt(nextDay, config.total_days, studentConfig);

  try {
    const response = await generateDay({
      systemPrompt,
      contextPrompt,
      userPrompt,
      apiKey,
    });

    const content = extractJSON<AdaptiveDayContent>(response);

    // Validate content structure
    const validationErrors = validateDayContent(content);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid content structure: ${validationErrors.join(', ')}`);
    }

    // Save day content (upsert in case of retry)
    await supabase.from('adaptive_workbook_days').upsert({
      config_id: configId,
      day_number: nextDay,
      content_json: content,
      review_status: 'pending',
      generated_at: new Date().toISOString(),
    }, { onConflict: 'config_id,day_number' });

    const newCompleted = nextDay;
    const isComplete = newCompleted >= config.total_days;

    await supabase
      .from('student_configs')
      .update({
        days_completed: newCompleted,
        status: isComplete ? 'review' : 'generating',
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId);

    return new Response(JSON.stringify({
      status: isComplete ? 'review' : 'generating',
      days_completed: newCompleted,
      total_days: config.total_days,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // Return error info but keep status 200 so polling continues.
    // The UI will display the error and admin can retry.
    return new Response(JSON.stringify({
      status: 'generating',
      days_completed: config.days_completed,
      total_days: config.total_days,
      error: import.meta.env.DEV ? `Day ${nextDay} failed: ${err.message}` : `Day ${nextDay} failed`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
