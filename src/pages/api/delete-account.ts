import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const runtime = (locals as any).runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceKey);

  // Check for active subscriptions - cancel them first via Stripe
  const { data: subs } = await adminClient
    .from('subscriptions')
    .select('status, stripe_subscription_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing']);

  if (subs && subs.length > 0) {
    // Cancel active Stripe subscriptions
    const stripeKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey);
      for (const sub of subs) {
        if (sub.stripe_subscription_id) {
          try {
            await stripe.subscriptions.cancel(sub.stripe_subscription_id);
          } catch (err) {
            console.error('Failed to cancel subscription:', err);
          }
        }
      }
    }
  }

  // Delete user via Supabase Admin API (cascades to profiles, etc. via ON DELETE CASCADE)
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('Delete account error:', error);
    return new Response(JSON.stringify({ error: import.meta.env.DEV ? error.message : 'An error occurred' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
