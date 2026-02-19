import Stripe from 'stripe';

export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export async function isPremiumUser(
  stripe: Stripe,
  supabase: any,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('subscriptions')
    .select('status, stripe_subscription_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (!data) return false;

  try {
    const subscription = await stripe.subscriptions.retrieve(data.stripe_subscription_id);
    return subscription.status === 'active' || subscription.status === 'trialing';
  } catch {
    return false;
  }
}
