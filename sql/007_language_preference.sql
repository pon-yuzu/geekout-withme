-- Add language preference column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT NULL
  CHECK (language_preference IN ('en', 'ja'));
