import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/admin';
import { getServiceClient } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const status = url.searchParams.get('status');

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  let query = serviceClient
    .from('bookings')
    .select('*')
    .order('slot_start', { ascending: true });

  if (from) query = query.gte('slot_start', from);
  if (to) query = query.lte('slot_start', to);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Enrich with user display names
  const userIds = [...new Set((data ?? []).filter((b: any) => b.user_id).map((b: any) => b.user_id))];
  let profiles: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profileData } = await serviceClient
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);
    if (profileData) {
      profiles = Object.fromEntries(profileData.map((p: any) => [p.id, p.display_name]));
    }
  }

  const bookings = (data ?? []).map((b: any) => ({
    ...b,
    display_name: b.user_id ? (profiles[b.user_id] || null) : null,
  }));

  return new Response(JSON.stringify({ bookings }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { id, ...updates } = body;
  if (!id) {
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
  }

  // Only allow specific fields to be updated
  const allowed = ['status', 'zoom_url', 'zoom_meeting_id', 'admin_notes', 'google_event_id'];
  const filtered: Record<string, any> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data, error } = await serviceClient
    .from('bookings')
    .update(filtered)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ booking: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
