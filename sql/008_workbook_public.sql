-- Add public/private visibility to workbooks
ALTER TABLE public.workbooks
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Allow premium users to read public workbooks (not just their own)
CREATE POLICY "public_select" ON public.workbooks
  FOR SELECT USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Allow public workbook days to be read by premium users
CREATE POLICY "public_select" ON public.workbook_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workbooks
      WHERE id = workbook_id
        AND is_public = true
        AND EXISTS (
          SELECT 1 FROM public.subscriptions
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
    )
  );
