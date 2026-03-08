import type { APIRoute } from 'astro';
import { getMyBookings } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const bookings = await getMyBookings(locals.supabase!, user.id);
    return new Response(JSON.stringify({ bookings }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('My bookings error:', err);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? (err as Error).message : 'An error occurred' }), { status: 500 });
  }
};
