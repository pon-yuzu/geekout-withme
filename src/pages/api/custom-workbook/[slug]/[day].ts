import type { APIRoute } from 'astro';

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

  // Fetch HTML from Storage using service role
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
  return new Response(JSON.stringify({ html, day: dayNum, totalDays: workbook.total_days }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
