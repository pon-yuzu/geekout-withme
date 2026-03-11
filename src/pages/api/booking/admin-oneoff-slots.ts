import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/admin';
import { getServiceClient } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data, error } = await serviceClient
    .from('booking_oneoff_slots')
    .select('*')
    .order('slot_date')
    .order('start_time');

  if (error) {
    console.error('Admin oneoff slots error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ slots: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
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

  const { slot_date, start_time, end_time } = body;

  if (!slot_date || !start_time || !end_time) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data, error } = await serviceClient
    .from('booking_oneoff_slots')
    .insert({
      slot_date,
      start_time,
      end_time,
    })
    .select()
    .single();

  if (error) {
    console.error('Admin oneoff slots error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ slot: data }), {
    status: 201,
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

  const allowed = ['slot_date', 'start_time', 'end_time', 'is_active'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  if (Object.keys(filtered).length === 0) {
    return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { data, error } = await serviceClient
    .from('booking_oneoff_slots')
    .update(filtered)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Admin oneoff slots PATCH error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ slot: data }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
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

  const { id } = body;
  if (!id) {
    return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const { error } = await serviceClient
    .from('booking_oneoff_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Admin oneoff slots error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
