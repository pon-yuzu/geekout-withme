import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const runtime = (locals as any).runtime;
  const adminEmails = (runtime?.env?.ADMIN_EMAILS || import.meta.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email.toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const [users, assessments, subscriptions, workbooks, dailySignups] = await Promise.all([
    supabase.from('admin_user_stats').select('*').single(),
    supabase.from('admin_assessment_stats').select('*').single(),
    supabase.from('admin_subscription_stats').select('*').single(),
    supabase.from('admin_workbook_stats').select('*').single(),
    supabase.from('admin_daily_signups').select('*'),
  ]);

  return new Response(JSON.stringify({
    users: users.data,
    assessments: assessments.data,
    subscriptions: subscriptions.data,
    workbooks: workbooks.data,
    dailySignups: dailySignups.data || [],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
