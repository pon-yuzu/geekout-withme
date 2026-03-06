import type { APIRoute } from 'astro';
import { getServiceClient, getAvailableSlots, cleanupStalePendingBookings } from '../../../lib/booking/db';
import { getFreeBusy, isGoogleCalendarConfigured } from '../../../lib/google-calendar';

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

    // Filter out slots that overlap with Google Calendar busy periods
    if (isGoogleCalendarConfigured(locals) && slots.length > 0) {
      const timeMin = slots[0].slot_start;
      const timeMax = slots[slots.length - 1].slot_end;
      try {
        const busyPeriods = await getFreeBusy(locals, timeMin, timeMax);
        if (busyPeriods.length > 0) {
          const filtered = slots.filter((slot: any) => {
            if (slot.is_booked) return true; // keep already-booked slots as-is
            const slotStart = new Date(slot.slot_start).getTime();
            const slotEnd = new Date(slot.slot_end).getTime();
            return !busyPeriods.some((busy) => {
              const busyStart = new Date(busy.start).getTime();
              const busyEnd = new Date(busy.end).getTime();
              return slotStart < busyEnd && slotEnd > busyStart;
            });
          });
          return new Response(JSON.stringify({ slots: filtered }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (e) {
        console.error('Google Calendar FreeBusy check failed, returning slots without filter:', e);
      }
    }

    return new Response(JSON.stringify({ slots }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
