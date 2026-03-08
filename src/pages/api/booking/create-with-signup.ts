import type { APIRoute } from 'astro';
import {
  getServiceClient,
  createMemberBooking,
  validateCoupon,
  useCoupon,
} from '../../../lib/booking/db';
import { runPostBookingSteps } from '../../../lib/booking/post-booking';
import { verifyTurnstile } from '../../../lib/turnstile';

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { guest_name, guest_email, password, slot_start, slot_end, notes, turnstileToken } = body;

  // 0. Turnstile verification
  const runtime = (locals as any).runtime;
  const turnstileSecret = runtime?.env?.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || undefined;
  const turnstileResult = await verifyTurnstile(turnstileToken, clientIp, turnstileSecret);
  if (!turnstileResult.success) {
    return new Response(JSON.stringify({ error: turnstileResult.error || 'CAPTCHA verification failed' }), { status: 400 });
  }

  // 1. Validation
  if (!guest_name?.trim() || !guest_email?.trim() || !password || !slot_start || !slot_end) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  if (password.length < 6) {
    return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400 });
  }

  const displayName = guest_name.trim();
  const email = guest_email.trim().toLowerCase();

  // 2. Service client
  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // 3. Validate FREE_TRIAL coupon
  const couponResult = await validateCoupon(serviceClient, 'FREE_TRIAL');
  if (!couponResult) {
    return new Response(JSON.stringify({ error: 'COUPON_INVALID' }), { status: 400 });
  }

  // 4. Check if FREE_TRIAL already used by this email (guest_email in bookings)
  const { data: existingGuestTrial } = await serviceClient
    .from('bookings')
    .select('id')
    .eq('coupon_id', couponResult.coupon_id)
    .eq('guest_email', email)
    .in('status', ['confirmed', 'pending_payment'])
    .limit(1)
    .maybeSingle();

  if (existingGuestTrial) {
    return new Response(JSON.stringify({ error: 'FREE_TRIAL_USED' }), { status: 400 });
  }

  // Also check if an existing user with this email already used FREE_TRIAL
  // (e.g. previously signed up via this flow)
  const { data: existingUserTrial } = await serviceClient
    .from('bookings')
    .select('id, user_id')
    .eq('coupon_id', couponResult.coupon_id)
    .not('user_id', 'is', null)
    .in('status', ['confirmed', 'pending_payment'])
    .limit(50);

  if (existingUserTrial && existingUserTrial.length > 0) {
    // Check if any of those users have this email
    for (const b of existingUserTrial) {
      const { data: userData } = await serviceClient.auth.admin.getUserById(b.user_id);
      if (userData?.user?.email?.toLowerCase() === email) {
        return new Response(JSON.stringify({ error: 'FREE_TRIAL_USED' }), { status: 400 });
      }
    }
  }

  // 5. Create Supabase Auth account
  const { data: newUserData, error: signupError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (signupError) {
    if (signupError.message?.toLowerCase().includes('already') || (signupError as any).status === 422) {
      return new Response(JSON.stringify({ error: 'ALREADY_REGISTERED' }), { status: 400 });
    }
    console.error('Signup failed:', signupError.message);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), { status: 500 });
  }

  const newUserId = newUserData.user.id;

  // 6. Create booking
  let booking;
  try {
    booking = await createMemberBooking(serviceClient, newUserId, {
      slot_start,
      slot_end,
      booking_type: 'public',
      status: 'confirmed',
      coupon_id: couponResult.coupon_id,
      amount_paid: 0,
      notes,
    });
  } catch (err: any) {
    if (err.message === 'SLOT_TAKEN') {
      return new Response(JSON.stringify({ error: 'SLOT_TAKEN' }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: 'Failed to create booking' }), { status: 500 });
  }

  // 7. Use coupon
  await useCoupon(serviceClient, couponResult.coupon_id);

  // 8. Post-booking steps (Zoom + GCal + Email)
  await runPostBookingSteps({
    locals,
    serviceClient,
    bookingId: booking.id,
    displayName,
    email,
    slotStart: slot_start,
    slotEnd: slot_end,
    notes,
    attendeeEmail: email,
  });

  return new Response(JSON.stringify({
    booking: { id: booking.id, slot_start: booking.slot_start, slot_end: booking.slot_end },
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
