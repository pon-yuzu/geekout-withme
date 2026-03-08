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

// PUT: Update review status for a day
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
  const { day_id, review_status, review_notes } = body;

  if (!day_id || !review_status) {
    return new Response(JSON.stringify({ error: 'Missing day_id or review_status' }), { status: 400 });
  }

  if (!['pending', 'approved', 'rejected'].includes(review_status)) {
    return new Response(JSON.stringify({ error: 'Invalid review_status' }), { status: 400 });
  }

  const updates: Record<string, unknown> = { review_status };
  if (review_notes !== undefined) updates.review_notes = review_notes;

  const { data, error } = await supabase
    .from('adaptive_workbook_days')
    .update(updates)
    .eq('id', day_id)
    .select()
    .single();

  if (error) {
    console.error('WB review error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ day: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST: Regenerate a specific day
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
  const { day_id } = body;

  if (!day_id) {
    return new Response(JSON.stringify({ error: 'Missing day_id' }), { status: 400 });
  }

  // Get the day record
  const { data: dayData, error: dayError } = await supabase
    .from('adaptive_workbook_days')
    .select('*, student_configs(*)')
    .eq('id', day_id)
    .single();

  if (dayError || !dayData) {
    return new Response(JSON.stringify({ error: 'Day not found' }), { status: 404 });
  }

  const config = dayData.student_configs;
  if (!config || !config.config_json) {
    return new Response(JSON.stringify({ error: 'Config data not found for this day' }), { status: 500 });
  }
  const studentConfig = config.config_json as StudentConfig;

  const systemPrompt = buildSystemPrompt(studentConfig.target_language || 'english');
  const contextPrompt = buildContextPrompt(studentConfig);
  const userPrompt = buildUserPrompt(dayData.day_number, config.total_days, studentConfig);

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

    const { data: updated, error: updateError } = await supabase
      .from('adaptive_workbook_days')
      .update({
        content_json: content,
        review_status: 'pending',
        review_notes: null,
        generated_at: new Date().toISOString(),
      })
      .eq('id', day_id)
      .select()
      .single();

    if (updateError) {
      console.error('WB review update error:', updateError);
      return new Response(JSON.stringify({ error: import.meta.env.DEV ? updateError.message : 'An error occurred' }), { status: 500 });
    }

    return new Response(JSON.stringify({ day: updated }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('WB regeneration error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? `Regeneration failed: ${err.message}` : 'Regeneration failed' }), { status: 500 });
  }
};
