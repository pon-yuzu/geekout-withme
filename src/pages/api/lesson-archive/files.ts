import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '../../../lib/admin';
import { getUserTier } from '../../../lib/tier';

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'pdf',
};

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const url = new URL(request.url);
  const studentId = url.searchParams.get('student_id') || user.id;
  const admin = isAdmin(user.email, locals);

  // Non-admin can only view their own files
  if (studentId !== user.id && !admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const supabase = admin ? getServiceClient(locals) : locals.supabase!;
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data: files, error } = await supabase
    .from('lesson_files')
    .select('*')
    .eq('student_id', studentId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Generate signed URLs for each file
  const serviceClient = getServiceClient(locals);
  const filesWithUrls = await Promise.all(
    (files || []).map(async (f: any) => {
      let signedUrl = '';
      if (serviceClient) {
        const { data } = await serviceClient.storage
          .from('lesson-archive')
          .createSignedUrl(f.storage_path, 3600); // 1 hour
        signedUrl = data?.signedUrl || '';
      }
      return { ...f, url: signedUrl };
    })
  );

  return new Response(JSON.stringify(filesWithUrls), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const studentId = (formData.get('student_id') as string) || user.id;
  const sessionDate = formData.get('session_date') as string | null;
  const memo = formData.get('memo') as string | null;

  const admin = isAdmin(user.email, locals);

  // Non-admin can only upload to their own archive
  if (studentId !== user.id && !admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Check that uploader (or target) has personal tier
  const supabase = locals.supabase!;
  const targetTier = await getUserTier(supabase, studentId);
  if (targetTier !== 'personal' && !admin) {
    return new Response(JSON.stringify({ error: 'Personal tier required' }), { status: 403 });
  }

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Response(JSON.stringify({ error: 'File too large (max 10MB)' }), { status: 400 });
  }

  const fileType = ALLOWED_TYPES[file.type];
  if (!fileType) {
    return new Response(JSON.stringify({ error: 'Only images (jpg/png/webp) and PDFs are allowed' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // Generate storage path
  const ext = file.name.split('.').pop() || (fileType === 'pdf' ? 'pdf' : 'jpg');
  const fileId = crypto.randomUUID();
  const storagePath = `${studentId}/${fileId}.${ext}`;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await serviceClient.storage
    .from('lesson-archive')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: 'Upload failed: ' + uploadError.message }), { status: 500 });
  }

  // Insert metadata
  const { data: record, error: dbError } = await serviceClient
    .from('lesson_files')
    .insert({
      student_id: studentId,
      uploaded_by: user.id,
      file_name: file.name,
      storage_path: storagePath,
      file_type: fileType,
      file_size_bytes: file.size,
      session_date: sessionDate || null,
      memo: memo || null,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file on DB error
    await serviceClient.storage.from('lesson-archive').remove([storagePath]);
    return new Response(JSON.stringify({ error: dbError.message }), { status: 500 });
  }

  return new Response(JSON.stringify(record), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { fileId } = await request.json();
  if (!fileId) {
    return new Response(JSON.stringify({ error: 'fileId is required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const admin = isAdmin(user.email, locals);

  // Get file record
  const { data: file } = await serviceClient
    .from('lesson_files')
    .select('id, storage_path, uploaded_by, student_id')
    .eq('id', fileId)
    .single();

  if (!file) {
    return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
  }

  // Permission: uploader or admin
  if (file.uploaded_by !== user.id && !admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Delete from storage
  await serviceClient.storage.from('lesson-archive').remove([file.storage_path]);

  // Delete from DB
  await serviceClient.from('lesson_files').delete().eq('id', fileId);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
