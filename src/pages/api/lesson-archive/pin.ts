import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';

export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const runtime = (locals as any).runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { fileId, is_pinned } = await request.json();

  if (!fileId || typeof is_pinned !== 'boolean') {
    return new Response(JSON.stringify({ error: 'fileId and is_pinned are required' }), { status: 400 });
  }

  const { error } = await supabase
    .from('lesson_files')
    .update({ is_pinned })
    .eq('id', fileId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
