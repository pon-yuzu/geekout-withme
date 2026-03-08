import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/admin';
import { getServiceClient, listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user?.email || !isAdmin(user.email, locals)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    const coupons = await listCoupons(serviceClient);
    return new Response(JSON.stringify({ coupons }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin coupons error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? (err as Error).message : 'An error occurred' }), { status: 500 });
  }
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

  const { code, label, user_id, price_yen, max_uses, expires_at } = body;
  if (!label) {
    return new Response(JSON.stringify({ error: 'label required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    const coupon = await createCoupon(serviceClient, {
      code: code || undefined,
      label,
      user_id: user_id || undefined,
      price_yen: price_yen ?? null,
      max_uses: max_uses ?? null,
      expires_at: expires_at ?? null,
    });
    return new Response(JSON.stringify({ coupon }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin coupons error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? (err as Error).message : 'An error occurred' }), { status: 500 });
  }
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

  const allowed = ['label', 'price_yen', 'max_uses', 'expires_at', 'is_active'];
  const filtered: any = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    const coupon = await updateCoupon(serviceClient, id, filtered);
    return new Response(JSON.stringify({ coupon }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin coupons error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? (err as Error).message : 'An error occurred' }), { status: 500 });
  }
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

  try {
    await deleteCoupon(serviceClient, id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Admin coupons error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? (err as Error).message : 'An error occurred' }), { status: 500 });
  }
};
