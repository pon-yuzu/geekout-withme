import type { APIRoute } from 'astro';
import { createStripeClient } from '../../lib/stripe';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  const stripe = createStripeClient(stripeSecretKey);
  const supabase = locals.supabase;

  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!customer) {
    return new Response(JSON.stringify({ error: 'No subscription found' }), { status: 404 });
  }

  const origin = import.meta.env.PUBLIC_SITE_URL || new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${origin}/community`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
