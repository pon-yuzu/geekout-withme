import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendBookingReminder } from '../../../lib/email';

/**
 * Cron endpoint for sending booking reminders.
 * Called by cron-job.org every 15 minutes.
 * Sends 24h and 1h reminders for upcoming confirmed bookings.
 */
export const GET: APIRoute = async ({ url, locals }) => {
  const runtime = (locals as any).runtime;

  // Auth: check cron secret
  const cronSecret = runtime?.env?.CRON_SECRET || import.meta.env.CRON_SECRET;
  const providedSecret = url.searchParams.get('secret') || '';
  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();
  const results: string[] = [];

  // --- 24h reminders ---
  const target24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const window24hStart = new Date(target24h.getTime() - 15 * 60 * 1000).toISOString();
  const window24hEnd = new Date(target24h.getTime() + 15 * 60 * 1000).toISOString();

  const { data: bookings24h } = await supabase
    .from('bookings')
    .select('id, user_id, guest_name, guest_email, slot_start, slot_end, zoom_url, notes')
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .gte('slot_start', window24hStart)
    .lte('slot_start', window24hEnd);

  for (const b of bookings24h || []) {
    const emailInfo = await resolveBookingEmail(supabase, b);
    if (!emailInfo) continue;

    const dur = Math.round((new Date(b.slot_end).getTime() - new Date(b.slot_start).getTime()) / 60000);
    try {
      await sendBookingReminder(locals, {
        to: emailInfo.email,
        userName: emailInfo.name,
        slotStart: b.slot_start,
        slotEnd: b.slot_end,
        durationMinutes: dur,
        zoomUrl: b.zoom_url,
        notes: b.notes,
        bookingId: b.id,
        reminderType: '24h',
      });
      await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', b.id);
      results.push(`24h: ${emailInfo.email}`);
    } catch (e: any) {
      results.push(`24h FAIL: ${emailInfo.email} — ${e.message}`);
    }
  }

  // --- 1h reminders ---
  const target1h = new Date(now.getTime() + 60 * 60 * 1000);
  const window1hStart = new Date(target1h.getTime() - 15 * 60 * 1000).toISOString();
  const window1hEnd = new Date(target1h.getTime() + 15 * 60 * 1000).toISOString();

  const { data: bookings1h } = await supabase
    .from('bookings')
    .select('id, user_id, guest_name, guest_email, slot_start, slot_end, zoom_url, notes')
    .eq('status', 'confirmed')
    .eq('reminder_1h_sent', false)
    .gte('slot_start', window1hStart)
    .lte('slot_start', window1hEnd);

  for (const b of bookings1h || []) {
    const emailInfo = await resolveBookingEmail(supabase, b);
    if (!emailInfo) continue;

    const dur = Math.round((new Date(b.slot_end).getTime() - new Date(b.slot_start).getTime()) / 60000);
    try {
      await sendBookingReminder(locals, {
        to: emailInfo.email,
        userName: emailInfo.name,
        slotStart: b.slot_start,
        slotEnd: b.slot_end,
        durationMinutes: dur,
        zoomUrl: b.zoom_url,
        notes: b.notes,
        bookingId: b.id,
        reminderType: '1h',
      });
      await supabase.from('bookings').update({ reminder_1h_sent: true }).eq('id', b.id);
      results.push(`1h: ${emailInfo.email}`);
    } catch (e: any) {
      results.push(`1h FAIL: ${emailInfo.email} — ${e.message}`);
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    sent: results.length,
    details: results,
    checked_at: now.toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

async function resolveBookingEmail(
  supabase: ReturnType<typeof createClient>,
  booking: any
): Promise<{ email: string; name: string } | null> {
  // Guest booking
  if (booking.guest_email) {
    return { email: booking.guest_email, name: booking.guest_name || 'Guest' };
  }
  // Member booking
  if (booking.user_id) {
    const { data } = await supabase.auth.admin.getUserById(booking.user_id);
    if (data?.user?.email) {
      return {
        email: data.user.email,
        name: data.user.user_metadata?.display_name || data.user.email,
      };
    }
  }
  return null;
}
