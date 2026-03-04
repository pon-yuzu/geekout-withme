-- 027: カスタムワークブック学習進捗トラッキング

CREATE TABLE public.custom_workbook_progress (
  workbook_id uuid NOT NULL REFERENCES public.custom_workbooks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workbook_id, user_id, day_number)
);

ALTER TABLE public.custom_workbook_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.custom_workbook_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_insert" ON public.custom_workbook_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_delete" ON public.custom_workbook_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "service_role_all" ON public.custom_workbook_progress
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_cwp_user ON public.custom_workbook_progress (user_id);
CREATE INDEX idx_cwp_workbook_user ON public.custom_workbook_progress (workbook_id, user_id);
