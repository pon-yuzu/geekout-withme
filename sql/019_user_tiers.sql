-- 019_user_tiers.sql — Add tier column to profiles for Personal/Premium/Free distinction

-- ============================================================
-- 1. Add tier column to profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free'
  CHECK (tier IN ('free', 'premium', 'personal'));

-- ============================================================
-- 2. RLS Policy: service_role can update any profile's tier
-- ============================================================

CREATE POLICY "Service role can update profiles"
  ON public.profiles FOR UPDATE
  USING (auth.role() = 'service_role');
