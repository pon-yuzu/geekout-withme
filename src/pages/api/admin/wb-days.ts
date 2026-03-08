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

// GET: Fetch all days for a config, or a single day by dayId
export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const dayId = url.searchParams.get('dayId');
  const configId = url.searchParams.get('configId');

  if (dayId) {
    // Single day
    const { data, error } = await supabase
      .from('adaptive_workbook_days')
      .select('*')
      .eq('id', dayId)
      .single();

    if (error) {
      console.error('WB days error:', error);
      return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
    }

    return new Response(JSON.stringify({ day: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (configId) {
    // All days for a config
    const { data, error } = await supabase
      .from('adaptive_workbook_days')
      .select('*')
      .eq('config_id', configId)
      .order('day_number', { ascending: true });

    if (error) {
      console.error('WB days error:', error);
      return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
    }

    return new Response(JSON.stringify({ days: data || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Provide configId or dayId' }), { status: 400 });
};
