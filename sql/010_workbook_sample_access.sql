-- Allow anyone (including anon/free users) to read public workbooks with <= 5 days (samples)
-- Drop existing public_select policies and recreate with broader access

-- Workbooks: allow SELECT for public samples (<=5 days) to everyone,
-- and public workbooks to premium users
DROP POLICY IF EXISTS "public_select" ON public.workbooks;
CREATE POLICY "public_select" ON public.workbooks
  FOR SELECT USING (
    is_public = true
    AND (
      -- Samples (5 days or fewer): anyone can read
      days_completed <= 5
      OR
      -- Full public workbooks: premium users only
      EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = auth.uid()
          AND status = 'active'
      )
    )
  );

-- Workbook days: same logic
DROP POLICY IF EXISTS "public_select" ON public.workbook_days;
CREATE POLICY "public_select" ON public.workbook_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workbooks
      WHERE id = workbook_id
        AND is_public = true
        AND (
          days_completed <= 5
          OR
          EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
    )
  );
