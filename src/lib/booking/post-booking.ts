import type { SupabaseClient } from '@supabase/supabase-js';
import { createZoomMeeting } from '../zoom';
import { createCalendarEvent } from '../google-calendar';
import { sendBookingConfirmation } from '../email';

export interface PostBookingParams {
  locals: any;
  serviceClient: SupabaseClient;
  bookingId: string;
  displayName: string;
  email: string;
  slotStart: string;
  slotEnd: string;
  notes?: string;
  attendeeEmail?: string;
}

export async function runPostBookingSteps(params: PostBookingParams): Promise<{ zoomUrl?: string }> {
  const { locals, serviceClient, bookingId, displayName, email, slotStart, slotEnd, notes, attendeeEmail } = params;
  const dur = Math.round((new Date(slotEnd).getTime() - new Date(slotStart).getTime()) / 60000);
  let zoomUrl: string | undefined;

  // Zoom
  try {
    const zoom = await createZoomMeeting(locals, `GOWM Session — ${displayName}`, slotStart, dur);
    await serviceClient.from('bookings').update({ zoom_url: zoom.join_url, zoom_meeting_id: String(zoom.meeting_id) }).eq('id', bookingId);
    zoomUrl = zoom.join_url;
  } catch (e) { console.error('Zoom creation failed:', e); }

  // Google Calendar
  try {
    const gcal = await createCalendarEvent(locals, {
      summary: `GOWM Session — ${displayName}`,
      startTime: slotStart,
      endTime: slotEnd,
      attendeeEmail: attendeeEmail || email,
    });
    await serviceClient.from('bookings').update({ google_event_id: gcal.id }).eq('id', bookingId);
  } catch (e) { console.error('Google Calendar creation failed:', e); }

  // Confirmation email
  try {
    await sendBookingConfirmation(locals, {
      to: email,
      userName: displayName,
      slotStart,
      slotEnd,
      durationMinutes: dur,
      zoomUrl,
      notes,
      bookingId,
    });
  } catch (e) { console.error('Confirmation email failed:', e); }

  return { zoomUrl };
}
