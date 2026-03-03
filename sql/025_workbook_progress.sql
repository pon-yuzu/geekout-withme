-- 025: ワークブック学習進捗トラッキング

CREATE TABLE public.workbook_progress (
  workbook_id text NOT NULL REFERENCES public.workbooks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workbook_id, user_id, day_number)
);

ALTER TABLE public.workbook_progress ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の進捗のみ参照可能
CREATE POLICY "own_select" ON public.workbook_progress
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の進捗のみ挿入可能
CREATE POLICY "own_insert" ON public.workbook_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の進捗のみ削除可能（完了取り消し用）
CREATE POLICY "own_delete" ON public.workbook_progress
  FOR DELETE USING (auth.uid() = user_id);

-- service_role はフルアクセス
CREATE POLICY "service_role_all" ON public.workbook_progress
  FOR ALL USING (auth.role() = 'service_role');

-- インデックス
CREATE INDEX idx_wp_user ON public.workbook_progress (user_id);
CREATE INDEX idx_wp_workbook_user ON public.workbook_progress (workbook_id, user_id);
