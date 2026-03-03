import type { APIRoute } from 'astro';
import { getServiceClient, validateCoupon } from '../../../lib/booking/db';

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { code } = body;
  if (!code || typeof code !== 'string') {
    return new Response(JSON.stringify({ error: 'code required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const userId = locals.user?.id;
  const result = await validateCoupon(serviceClient, code.trim(), userId);

  if (!result) {
    return new Response(JSON.stringify({ valid: false, reason: 'Invalid or expired coupon' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    valid: true,
    coupon_id: result.coupon_id,
    price_yen: result.price_yen,
    label: result.label,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
