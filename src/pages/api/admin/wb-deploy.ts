import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

// POST: Deploy workbook (create custom_workbooks record)
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const body = await request.json();
  const { config_id, slug, title, theme_color, navigator_name, description } = body;

  if (!config_id || !slug || !title) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // Verify all days are approved
  const { data: config, error: configError } = await supabase
    .from('student_configs')
    .select('*')
    .eq('id', config_id)
    .single();

  if (configError || !config) {
    return new Response(JSON.stringify({ error: 'Config not found' }), { status: 404 });
  }

  const { data: days, error: daysError } = await supabase
    .from('adaptive_workbook_days')
    .select('day_number, review_status')
    .eq('config_id', config_id)
    .order('day_number');

  if (daysError) {
    return new Response(JSON.stringify({ error: daysError.message }), { status: 500 });
  }

  if (!days || days.length < config.total_days) {
    return new Response(JSON.stringify({
      error: `Only ${days?.length || 0} of ${config.total_days} days generated`,
    }), { status: 400 });
  }

  const unapproved = days.filter((d: any) => d.review_status !== 'approved');
  if (unapproved.length > 0) {
    return new Response(JSON.stringify({
      error: `${unapproved.length} days not yet approved`,
      unapproved_days: unapproved.map((d: any) => d.day_number),
    }), { status: 400 });
  }

  // Create custom_workbooks record (links to existing student UI)
  const { data: workbook, error: wbError } = await supabase
    .from('custom_workbooks')
    .upsert({
      user_id: config.user_id,
      slug,
      title,
      description: description || null,
      total_days: config.total_days,
      theme_color: theme_color || '#f97316',
      navigator_name: navigator_name || null,
      storage_path: `adaptive/${config.user_id}/${slug}`,
    }, { onConflict: 'user_id,slug' })
    .select()
    .single();

  if (wbError) {
    return new Response(JSON.stringify({ error: wbError.message }), { status: 500 });
  }

  // Update config status to active
  await supabase
    .from('student_configs')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', config_id);

  return new Response(JSON.stringify({
    success: true,
    workbook,
    url: `/my/workbook/custom/${slug}`,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
