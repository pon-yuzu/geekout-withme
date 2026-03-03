import type { APIRoute } from 'astro';
import { getServiceClient, getAvailableSlots, cleanupStalePendingBookings } from '../../../lib/booking/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const week = url.searchParams.get('week');
  const weeks = Math.min(4, parseInt(url.searchParams.get('weeks') || '2'));
  const duration = Math.min(120, Math.max(30, parseInt(url.searchParams.get('duration') || '60')));
  const buffer = parseInt(url.searchParams.get('buffer') || '10');

  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return new Response(JSON.stringify({ error: 'Invalid week parameter' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  try {
    // Cleanup stale pending bookings on each request
    await cleanupStalePendingBookings(serviceClient);

    const slots = await getAvailableSlots(serviceClient, week, weeks, duration, buffer);
    return new Response(JSON.stringify({ slots }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
