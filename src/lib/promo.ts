/**
 * Limited-time free promotion config.
 * After the deadline, all promo logic evaluates to false
 * and the normal premium gating resumes.
 */

const PROMO_END = new Date('2026-03-31T23:59:59+09:00');

export function isPromoActive(): boolean {
  return new Date() < PROMO_END;
}

export const PROMO_END_LABEL = '3/31';
