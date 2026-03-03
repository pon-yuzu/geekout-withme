import { isPromoActive } from './promo';

export type UserTier = 'free' | 'premium' | 'personal';

export async function getUserTier(supabase: any, userId: string): Promise<UserTier> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  if (profile?.tier === 'personal') return 'personal';
  if (profile?.tier === 'premium') return 'premium';

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .limit(1)
    .maybeSingle();

  if (sub) return 'premium';

  if (isPromoActive()) return 'premium';

  return 'free';
}

const TIER_LEVELS: Record<UserTier, number> = {
  free: 0,
  premium: 1,
  personal: 2,
};

export function tierLevel(tier: UserTier): number {
  return TIER_LEVELS[tier];
}

export function hasTierAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  return tierLevel(userTier) >= tierLevel(requiredTier);
}
