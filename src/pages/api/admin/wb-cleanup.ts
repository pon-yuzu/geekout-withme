import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { WORKBOOK_TTL_DAYS } from '../../../lib/workbook/db';

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
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response('DB not configured', { status: 500 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - WORKBOOK_TTL_DAYS);

  // Delete expired workbooks (workbook_days and workbook_progress cascade)
  const { data, error } = await supabase
    .from('workbooks')
    .delete()
    .lt('created_at', cutoff.toISOString())
    .select('id');

  if (error) {
    console.error('Workbook cleanup error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deletedCount = data?.length ?? 0;
  console.log(`Workbook cleanup: deleted ${deletedCount} expired workbooks`);

  return new Response(
    JSON.stringify({ deleted: deletedCount, cutoff: cutoff.toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
