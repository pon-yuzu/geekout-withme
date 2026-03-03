-- 024: ティア有効期限カラム追加
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier_expires_at timestamptz;
