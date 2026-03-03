import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserTier } from './tier';

export async function hasLineSupport(
  supabase: SupabaseClient,
  userId: string,
  userTier: UserTier,
  lineSupportPriceId: string
): Promise<boolean> {
  if (userTier === 'personal') return true;

  if (!lineSupportPriceId) return false;

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('price_id', lineSupportPriceId)
    .in('status', ['active', 'trialing'])
    .limit(1);

  return (subs?.length ?? 0) > 0;
}
