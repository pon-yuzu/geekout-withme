import type { APIRoute } from 'astro';
import { createStripeClient } from '../../lib/stripe';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const runtime = (locals as any).runtime;
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
  const priceId = runtime?.env?.STRIPE_PRICE_ID || import.meta.env.STRIPE_PRICE_ID;

  if (!stripeSecretKey || !priceId) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  const stripe = createStripeClient(stripeSecretKey);
  const supabase = locals.supabase;

  // Get or create Stripe customer
  let customerId: string;
  const { data: existingCustomer } = await supabase
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

    await supabase.from('stripe_customers').insert({
      id: user.id,
      stripe_customer_id: customer.id,
    });
  }

  const origin = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 30,
    },
    success_url: `${origin}/community?success=true`,
    cancel_url: `${origin}/community?canceled=true`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
