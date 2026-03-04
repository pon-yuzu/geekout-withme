-- 026: Custom Workbooks (Personal生徒向けカスタム教材)
-- Supabase Storage + DB metadata for coach-created workbooks

-- ============================================================
-- 1. custom_workbooks テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_workbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  total_days integer NOT NULL DEFAULT 30,
  theme_color text DEFAULT '#e8a4b8',
  navigator_name text,
  navigator_image_url text,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, slug)
);

-- ============================================================
-- 2. RLS
-- ============================================================
ALTER TABLE public.custom_workbooks ENABLE ROW LEVEL SECURITY;

-- Users can view their own custom workbooks
CREATE POLICY "custom_workbooks_own_select"
  ON public.custom_workbooks FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (admin operations)
CREATE POLICY "custom_workbooks_service_all"
  ON public.custom_workbooks FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 3. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_custom_workbooks_user
  ON public.custom_workbooks (user_id);

-- ============================================================
-- 4. Storage bucket (run manually in Supabase Dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('custom-workbooks', 'custom-workbooks', false);
--
-- Storage policies (run in SQL Editor):
--
-- Allow authenticated users to read their own files:
-- CREATE POLICY "custom_workbooks_storage_select"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'custom-workbooks'
--     AND auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
--
-- Allow service role to upload:
-- CREATE POLICY "custom_workbooks_storage_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'custom-workbooks'
--     AND auth.role() = 'service_role'
--   );
