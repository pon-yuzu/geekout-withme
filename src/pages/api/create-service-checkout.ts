import type { APIRoute } from 'astro';
import { createStripeClient } from '../../lib/stripe';

const VALID_PRODUCTS = ['workbook', 'coaching', 'session'] as const;
type ProductType = (typeof VALID_PRODUCTS)[number];

const PRICE_KEY_MAP: Record<ProductType, string> = {
  workbook: 'STRIPE_WORKBOOK_PRICE_ID',
  coaching: 'STRIPE_COACHING_PRICE_ID',
  session: 'STRIPE_SESSION_PRICE_ID',
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const productType = body.productType as ProductType;

  if (!VALID_PRODUCTS.includes(productType)) {
    return new Response(JSON.stringify({ error: 'Invalid product type' }), { status: 400 });
  }

  const runtime = (locals as any).runtime;
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
  const priceId = runtime?.env?.[PRICE_KEY_MAP[productType]] || (import.meta.env as any)[PRICE_KEY_MAP[productType]];

  if (!stripeSecretKey || !priceId) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
  }

  const stripe = createStripeClient(stripeSecretKey);
  const supabase = locals.supabase;

  // Purchase restriction checks
  if (productType === 'coaching') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const { data: recentPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_type', 'coaching')
      .gte('created_at', threeMonthsAgo.toISOString())
      .limit(1)
      .single();

    if (recentPurchase) {
      return new Response(JSON.stringify({ error: 'coaching_cooldown' }), { status: 400 });
    }
  }

  if (productType === 'session') {
    const { data: hasCoaching } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_type', 'coaching')
      .limit(1)
      .single();

    if (!hasCoaching) {
      return new Response(JSON.stringify({ error: 'coaching_required' }), { status: 400 });
    }
  }

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
    mode: 'payment',
    success_url: `${origin}/services/${productType}/thanks`,
    cancel_url: `${origin}/services?canceled=true`,
    metadata: {
      product_type: productType,
      user_id: user.id,
    },
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
