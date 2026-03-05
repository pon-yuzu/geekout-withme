import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, day } = params;
  const dayNum = parseInt(day || '0', 10);
  if (!slug || dayNum < 1) {
    return new Response(JSON.stringify({ error: 'Invalid params' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = locals.supabase;
  const runtime = (locals as any).runtime;
  const serviceRoleKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

  // Verify this workbook belongs to the user
  const { data: workbook } = await supabase
    .from('custom_workbooks')
    .select('id, storage_path, total_days')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  if (!workbook) {
    return new Response(JSON.stringify({ error: 'Workbook not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (dayNum > workbook.total_days) {
    return new Response(JSON.stringify({ error: 'Day out of range' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if this is an adaptive workbook (storage_path starts with "adaptive/")
  if (workbook.storage_path.startsWith('adaptive/')) {
    const serviceClient = getServiceClient(locals);
    if (!serviceClient) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the student_config for this user
    const { data: config } = await serviceClient
      .from('student_configs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!config) {
      return new Response(JSON.stringify({ error: 'Config not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch content_json from adaptive_workbook_days
    const { data: dayData } = await serviceClient
      .from('adaptive_workbook_days')
      .select('content_json')
      .eq('config_id', config.id)
      .eq('day_number', dayNum)
      .eq('review_status', 'approved')
      .single();

    if (!dayData?.content_json) {
      return new Response(JSON.stringify({ error: 'Content not available' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      content_json: dayData.content_json,
      day: dayNum,
      totalDays: workbook.total_days,
      type: 'adaptive',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Standard HTML-based custom workbook
  const storagePath = `${workbook.storage_path}/day${dayNum}.html`;
  const storageRes = await fetch(
    `${supabaseUrl}/storage/v1/object/custom-workbooks/${storagePath}`,
    {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (!storageRes.ok) {
    return new Response(JSON.stringify({ error: 'Content not available' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const html = await storageRes.text();
  return new Response(JSON.stringify({ html, day: dayNum, totalDays: workbook.total_days, type: 'html' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
