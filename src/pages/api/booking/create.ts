import type { APIRoute } from 'astro';
import { createStripeClient } from '../../../lib/stripe';
import {
  getServiceClient,
  createMemberBooking,
  validateCoupon,
  getUserAutoCoupons,
  useCoupon,
} from '../../../lib/booking/db';
import { getUserTier, hasTierAccess } from '../../../lib/tier';

const DEFAULT_PRICE_YEN = 10000;

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

  const { slot_start, slot_end, booking_type, coupon_code, notes } = body;

  if (!slot_start || !slot_end || !booking_type) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['public', 'personal'].includes(booking_type)) {
    return new Response(JSON.stringify({ error: 'Invalid booking_type' }), { status: 400 });
  }

  const serviceClient = getServiceClient(locals);
  if (!serviceClient) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // --- Personal booking: no payment ---
  if (booking_type === 'personal') {
    const supabase = locals.supabase!;
    const tier = await getUserTier(supabase, user.id);
    if (!hasTierAccess(tier, 'personal')) {
      return new Response(JSON.stringify({ error: 'Personal tier required' }), { status: 403 });
    }

    try {
      const booking = await createMemberBooking(serviceClient, user.id, {
        slot_start,
        slot_end,
        booking_type: 'personal',
        status: 'confirmed',
        amount_paid: null,
        notes,
      });
      return new Response(JSON.stringify({ booking }), {
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

  // --- Public booking: coupon + Stripe ---
  let couponId: string | undefined;
  let price = DEFAULT_PRICE_YEN;

  // 1. Check user-bound auto coupons first
  const autoCoupons = await getUserAutoCoupons(serviceClient, user.id);
  if (autoCoupons.length > 0) {
    const auto = autoCoupons[0];
    couponId = auto.id;
    price = auto.price_yen ?? 0;
  }

  // 2. If coupon_code provided, it overrides auto coupon
  if (coupon_code) {
    const result = await validateCoupon(serviceClient, coupon_code, user.id);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Invalid or expired coupon' }), { status: 400 });
    }
    couponId = result.coupon_id;
    price = result.price_yen;
  }

  // --- Price === 0: direct confirm (no Stripe) ---
  if (price === 0) {
    try {
      const booking = await createMemberBooking(serviceClient, user.id, {
        slot_start,
        slot_end,
        booking_type: 'public',
        status: 'confirmed',
        coupon_id: couponId,
        amount_paid: 0,
        notes,
      });
      if (couponId) await useCoupon(serviceClient, couponId);
      return new Response(JSON.stringify({ booking }), {
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
  const runtime = (locals as any).runtime;
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  try {
    const stripe = createStripeClient(stripeSecretKey);

    // Get or create Stripe customer
    let customerId: string;
    const { data: existingCustomer } = await serviceClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await serviceClient.from('stripe_customers').insert({
        id: user.id,
        stripe_customer_id: customer.id,
      });
    }

    const origin = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
        type: 'booking',
        user_id: user.id,
        slot_start,
        slot_end,
        booking_type: 'public',
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
