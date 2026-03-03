import type { APIRoute } from 'astro';
import { getServiceClient, getUserAutoCoupons } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const coupons = await getUserAutoCoupons(serviceClient, user.id);

  return new Response(JSON.stringify({ coupons }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
