import type { APIRoute } from 'astro';
import { createStripeClient } from '../../../lib/stripe';
import {
  getServiceClient,
  createGuestBooking,
  validateCoupon,
  useCoupon,
} from '../../../lib/booking/db';
import { createZoomMeeting } from '../../../lib/zoom';
import { createCalendarEvent } from '../../../lib/google-calendar';
import { sendBookingConfirmation } from '../../../lib/email';
import { verifyTurnstile } from '../../../lib/turnstile';

const DEFAULT_PRICE_YEN = 10000;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { guest_name, guest_email, slot_start, slot_end, coupon_code, notes, turnstileToken } = body;

  // Turnstile verification
  const runtime = (locals as any).runtime;
  const turnstileSecret = runtime?.env?.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || undefined;
  const turnstileResult = await verifyTurnstile(turnstileToken, clientIp, turnstileSecret);
  if (!turnstileResult.success) {
    return new Response(JSON.stringify({ error: turnstileResult.error || 'CAPTCHA verification failed' }), { status: 400 });
  }

  if (!guest_name?.trim() || !guest_email?.trim() || !slot_start || !slot_end) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  let couponId: string | undefined;
  let price = DEFAULT_PRICE_YEN;

  // Validate coupon code if provided (guests don't have user-bound coupons)
  if (coupon_code) {
    const result = await validateCoupon(serviceClient, coupon_code);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Invalid or expired coupon' }), { status: 400 });
    }
    couponId = result.coupon_id;
    price = result.price_yen;
  }

  const guestName = guest_name.trim();
  const guestEmail = guest_email.trim().toLowerCase();

  // --- Price === 0: direct confirm ---
  if (price === 0) {
    try {
      const booking = await createGuestBooking(serviceClient, {
        guest_name: guestName,
        guest_email: guestEmail,
        slot_start,
        slot_end,
        status: 'confirmed',
        coupon_id: couponId,
        amount_paid: 0,
        notes,
      });
      if (couponId) await useCoupon(serviceClient, couponId);

      // Zoom + Google Calendar + Email (non-blocking)
      const dur = Math.round((new Date(slot_end).getTime() - new Date(slot_start).getTime()) / 60000);
      let zoomUrl: string | undefined;
      try {
        const zoom = await createZoomMeeting(locals, `GOWM Session — ${guestName}`, slot_start, dur);
        await serviceClient.from('bookings').update({ zoom_url: zoom.join_url, zoom_meeting_id: String(zoom.meeting_id) }).eq('id', booking.id);
        zoomUrl = zoom.join_url;
      } catch (e) { console.error('Zoom creation failed:', e); }

      try {
        const gcal = await createCalendarEvent(locals, { summary: `GOWM Session — ${guestName}`, startTime: slot_start, endTime: slot_end, attendeeEmail: guestEmail });
        await serviceClient.from('bookings').update({ google_event_id: gcal.id }).eq('id', booking.id);
      } catch (e) { console.error('Google Calendar creation failed:', e); }

      try {
        await sendBookingConfirmation(locals, {
          to: guestEmail,
          userName: guestName,
          slotStart: slot_start,
          slotEnd: slot_end,
          durationMinutes: dur,
          zoomUrl,
          notes,
          bookingId: booking.id,
        });
      } catch (e) { console.error('Confirmation email failed:', e); }

      return new Response(JSON.stringify({
        booking: { id: booking.id, slot_start: booking.slot_start, slot_end: booking.slot_end },
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      if (err.message === 'SLOT_TAKEN') {
        return new Response(JSON.stringify({ error: 'SLOT_TAKEN' }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), { status: 500 });
    }
  }

  // --- Price > 0: Stripe Checkout only (booking created in webhook) ---
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  try {
    const stripe = createStripeClient(stripeSecretKey);
    const origin = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'Coaching Session (60min)',
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking?canceled=true`,
      metadata: {
        type: 'booking_guest',
        guest_name: guestName,
        guest_email: guestEmail,
        slot_start,
        slot_end,
        coupon_id: couponId || '',
        amount_paid: String(price),
        notes: notes || '',
      },
    });

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), { status: 500 });
  }
};
