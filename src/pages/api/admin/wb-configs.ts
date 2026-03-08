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

function forbidden() {
  return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
}

function serverError(msg: string) {
  console.error('WB configs error:', msg);
  return new Response(JSON.stringify({ error: import.meta.env.DEV ? msg : 'An error occurred' }), { status: 500 });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// GET: List all configs with user info
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) return forbidden();

  const supabase = getServiceClient(locals);
  if (!supabase) return serverError('Server configuration error');

  const { data: configs, error } = await supabase
    .from('student_configs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return serverError(error.message);

  // Enrich with user info
  const userIds = [...new Set((configs || []).map((c: any) => c.user_id))];
  const userMap: Record<string, { email: string; display_name: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);

    for (const p of profiles || []) {
      userMap[p.id] = { email: '', display_name: p.display_name };
    }

    for (const uid of userIds) {
      const { data } = await supabase.auth.admin.getUserById(uid);
      if (data?.user?.email && userMap[uid]) {
        userMap[uid].email = data.user.email;
      }
    }
  }

  const enriched = (configs || []).map((c: any) => ({
    ...c,
    user_email: userMap[c.user_id]?.email || null,
    display_name: userMap[c.user_id]?.display_name || c.config_json?.student?.display_name || null,
  }));

  return json({ configs: enriched });
};

// POST: Create new config
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) return forbidden();

  const supabase = getServiceClient(locals);
  if (!supabase) return serverError('Server configuration error');

  const body = await request.json();
  const { user_id, config_json, total_days, generation_mode } = body;

  if (!user_id || !config_json) {
    return json({ error: 'Missing required fields: user_id, config_json' }, 400);
  }

  const { data, error } = await supabase
    .from('student_configs')
    .upsert({
      user_id,
      config_json,
      total_days: total_days || 30,
      generation_mode: generation_mode || 'batch',
      status: 'draft',
      days_completed: 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return serverError(error.message);

  return json({ config: data });
};

// PUT: Update existing config
export const PUT: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) return forbidden();

  const supabase = getServiceClient(locals);
  if (!supabase) return serverError('Server configuration error');

  const body = await request.json();
  const { id, config_json, status, generation_mode } = body;

  if (!id) {
    return json({ error: 'Missing config id' }, 400);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (config_json) updates.config_json = config_json;
  if (status) updates.status = status;
  if (generation_mode) updates.generation_mode = generation_mode;

  const { data, error } = await supabase
    .from('student_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return serverError(error.message);

  return json({ config: data });
};

// DELETE: Remove config and all associated days
export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) return forbidden();

  const supabase = getServiceClient(locals);
  if (!supabase) return serverError('Server configuration error');

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id' }, 400);

  // Cascade delete handles adaptive_workbook_days
  const { error } = await supabase
    .from('student_configs')
    .delete()
    .eq('id', id);

  if (error) return serverError(error.message);

  return json({ success: true });
};
