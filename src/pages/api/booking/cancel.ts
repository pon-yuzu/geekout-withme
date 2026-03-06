import type { APIRoute } from 'astro';
import { getServiceClient, cancelBooking } from '../../../lib/booking/db';
import { deleteZoomMeeting } from '../../../lib/zoom';
import { sendBookingCancellation } from '../../../lib/email';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { booking_id } = body;
  if (!booking_id) {
    return new Response(JSON.stringify({ error: 'booking_id required' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // Fetch booking details before cancellation (for Zoom deletion + email)
  const { data: booking } = await serviceClient
    .from('bookings')
    .select('id, user_id, guest_email, guest_name, slot_start, slot_end, zoom_meeting_id, zoom_url, notes, status')
    .eq('id', booking_id)
    .eq('user_id', user.id)
    .single();

  try {
    await cancelBooking(serviceClient, booking_id, user.id);

    // Delete Zoom meeting if exists
    if (booking?.zoom_meeting_id) {
      try {
        await deleteZoomMeeting(locals, booking.zoom_meeting_id);
      } catch (e) { console.error('Zoom deletion failed:', e); }
    }

    // Send cancellation email
    if (booking) {
      const dur = Math.round((new Date(booking.slot_end).getTime() - new Date(booking.slot_start).getTime()) / 60000);
      try {
        const cancelEmail = booking.guest_email || user.email!;
        const cancelName = booking.guest_name || user.user_metadata?.display_name || user.email!;
        await sendBookingCancellation(locals, {
          to: cancelEmail,
          userName: cancelName,
          slotStart: booking.slot_start,
          slotEnd: booking.slot_end,
          durationMinutes: dur,
          zoomUrl: booking.zoom_url,
          notes: booking.notes,
        });
      } catch (e) { console.error('Cancellation email failed:', e); }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
