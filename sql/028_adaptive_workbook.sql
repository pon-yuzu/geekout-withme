-- 028: Adaptive Custom Workbook Generation System (Phase 1)

-- Student configs: hearing data for personalized workbook generation
CREATE TABLE IF NOT EXISTS public.student_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_json jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'generating', 'review', 'active')),
  generation_mode text NOT NULL DEFAULT 'batch'
    CHECK (generation_mode IN ('batch', 'weekly', 'daily')),
  days_completed integer NOT NULL DEFAULT 0,
  total_days integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Adaptive workbook days: generated content per day
CREATE TABLE IF NOT EXISTS public.adaptive_workbook_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES public.student_configs(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  content_json jsonb,
  review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_notes text,
  generated_at timestamptz,
  generation_context jsonb,
  UNIQUE (config_id, day_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_configs_user_id ON public.student_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_student_configs_status ON public.student_configs(status);
CREATE INDEX IF NOT EXISTS idx_adaptive_workbook_days_config_id ON public.adaptive_workbook_days(config_id);

-- RLS
ALTER TABLE public.student_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_workbook_days ENABLE ROW LEVEL SECURITY;

-- Service role full access (admin APIs use service role)
CREATE POLICY "service_role_all_student_configs"
  ON public.student_configs FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_adaptive_days"
  ON public.adaptive_workbook_days FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Users can read their own config (for future use)
CREATE POLICY "users_read_own_config"
  ON public.student_configs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
