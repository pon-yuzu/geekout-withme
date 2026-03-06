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

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = getServiceClient(locals);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const formData = await request.formData();
  const workbookId = formData.get('workbook_id') as string;

  if (!workbookId) {
    return new Response(JSON.stringify({ error: 'Missing workbook_id' }), { status: 400 });
  }

  // Fetch workbook metadata
  const { data: workbook, error: wbError } = await supabase
    .from('custom_workbooks')
    .select('*')
    .eq('id', workbookId)
    .single();

  if (wbError || !workbook) {
    return new Response(JSON.stringify({ error: 'Workbook not found' }), { status: 404 });
  }

  const storagePath = workbook.storage_path || `${workbook.user_id}/${workbook.slug}`;
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return new Response(JSON.stringify({ error: 'No files provided' }), { status: 400 });
  }

  // Validate file names (day1.html, day2.html, ... dayN.html)
  const uploaded: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const match = file.name.match(/^day(\d+)\.html$/i);
    if (!match) {
      errors.push(`Invalid filename: ${file.name} (expected dayN.html)`);
      continue;
    }

    const dayNum = parseInt(match[1], 10);
    if (dayNum < 1 || dayNum > workbook.total_days) {
      errors.push(`Day ${dayNum} out of range (1-${workbook.total_days})`);
      continue;
    }

    const content = await file.text();
    const filePath = `${storagePath}/day${dayNum}.html`;

    const { error: uploadError } = await supabase.storage
      .from('custom-workbooks')
      .upload(filePath, content, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      errors.push(`Failed to upload day${dayNum}: ${uploadError.message}`);
    } else {
      uploaded.push(`day${dayNum}.html`);
    }
  }

  return new Response(JSON.stringify({
    uploaded,
    errors,
    total_uploaded: uploaded.length,
    total_errors: errors.length,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
