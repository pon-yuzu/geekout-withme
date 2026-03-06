import type { APIRoute } from 'astro';
import { createStripeClient } from '../../../lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { createMemberBooking, createGuestBooking, useCoupon } from '../../../lib/booking/db';
import { createZoomMeeting } from '../../../lib/zoom';
import { createCalendarEvent } from '../../../lib/google-calendar';
import { sendBookingConfirmation } from '../../../lib/email';

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime;
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = runtime?.env?.STRIPE_WEBHOOK_SECRET || import.meta.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return new Response('Server configuration error', { status: 500 });
  }

  const stripe = createStripeClient(stripeSecretKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed`, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (customer) {
        await supabase.from('subscriptions').upsert({
          user_id: customer.id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'stripe_subscription_id' });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const meta = session.metadata || {};

      if (session.mode === 'payment') {
        // --- Member booking paid ---
        if (meta.type === 'booking' && meta.user_id && meta.slot_start) {
          try {
            const booking = await createMemberBooking(supabase, meta.user_id, {
              slot_start: meta.slot_start,
              slot_end: meta.slot_end,
              booking_type: meta.booking_type || 'public',
              status: 'confirmed',
              coupon_id: meta.coupon_id || undefined,
              amount_paid: Number(meta.amount_paid) || 0,
              stripe_session_id: session.id,
              notes: meta.notes || undefined,
            });
            if (meta.coupon_id) await useCoupon(supabase, meta.coupon_id);

            // Zoom + Google Calendar + Email
            const dur = Math.round((new Date(meta.slot_end).getTime() - new Date(meta.slot_start).getTime()) / 60000);
            let zoomUrl: string | undefined;
            try {
              const zoom = await createZoomMeeting(locals, `GOWM Session`, meta.slot_start, dur);
              await supabase.from('bookings').update({ zoom_url: zoom.join_url, zoom_meeting_id: String(zoom.meeting_id) }).eq('id', booking.id);
              zoomUrl = zoom.join_url;
            } catch (e) { console.error('Zoom creation failed:', e); }

            try {
              const gcal = await createCalendarEvent(locals, { summary: `GOWM Session`, startTime: meta.slot_start, endTime: meta.slot_end });
              await supabase.from('bookings').update({ google_event_id: gcal.id }).eq('id', booking.id);
            } catch (e) { console.error('Google Calendar creation failed:', e); }

            try {
              const { data: userData } = await supabase.auth.admin.getUserById(meta.user_id);
              const email = userData?.user?.email;
              if (email) {
                await sendBookingConfirmation(locals, {
                  to: email,
                  userName: userData?.user?.user_metadata?.display_name || email,
                  slotStart: meta.slot_start,
                  slotEnd: meta.slot_end,
                  durationMinutes: dur,
                  zoomUrl,
                  notes: meta.notes,
                  bookingId: booking.id,
                });
              }
            } catch (e) { console.error('Confirmation email failed:', e); }
          } catch (err: any) {
            console.error('Webhook booking creation failed:', err.message);
          }
        }

        // --- Guest booking paid ---
        if (meta.type === 'booking_guest' && meta.guest_email && meta.slot_start) {
          try {
            const booking = await createGuestBooking(supabase, {
              guest_name: meta.guest_name,
              guest_email: meta.guest_email,
              slot_start: meta.slot_start,
              slot_end: meta.slot_end,
              status: 'confirmed',
              coupon_id: meta.coupon_id || undefined,
              amount_paid: Number(meta.amount_paid) || 0,
              stripe_session_id: session.id,
              notes: meta.notes || undefined,
            });
            if (meta.coupon_id) await useCoupon(supabase, meta.coupon_id);

            // Zoom + Google Calendar + Email
            const dur = Math.round((new Date(meta.slot_end).getTime() - new Date(meta.slot_start).getTime()) / 60000);
            let zoomUrl: string | undefined;
            try {
              const zoom = await createZoomMeeting(locals, `GOWM Session — ${meta.guest_name}`, meta.slot_start, dur);
              await supabase.from('bookings').update({ zoom_url: zoom.join_url, zoom_meeting_id: String(zoom.meeting_id) }).eq('id', booking.id);
              zoomUrl = zoom.join_url;
            } catch (e) { console.error('Zoom creation failed:', e); }

            try {
              const gcal = await createCalendarEvent(locals, { summary: `GOWM Session — ${meta.guest_name}`, startTime: meta.slot_start, endTime: meta.slot_end, attendeeEmail: meta.guest_email });
              await supabase.from('bookings').update({ google_event_id: gcal.id }).eq('id', booking.id);
            } catch (e) { console.error('Google Calendar creation failed:', e); }

            try {
              await sendBookingConfirmation(locals, {
                to: meta.guest_email,
                userName: meta.guest_name || 'Guest',
                slotStart: meta.slot_start,
                slotEnd: meta.slot_end,
                durationMinutes: dur,
                zoomUrl,
                notes: meta.notes,
                bookingId: booking.id,
              });
            } catch (e) { console.error('Confirmation email failed:', e); }
          } catch (err: any) {
            console.error('Webhook guest booking creation failed:', err.message);
          }
        }

        // --- Product purchase (workbook, coaching, etc.) ---
        if (meta.product_type) {
          await supabase.from('purchases').insert({
            user_id: meta.user_id,
            product_type: meta.product_type,
            stripe_session_id: session.id,
            amount: session.amount_total,
          });
        }
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
