-- Daily AI usage quota tracking (global, not per-user)
CREATE TABLE IF NOT EXISTS daily_usage (
  usage_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  level_check INT NOT NULL DEFAULT 0,
  workbook INT NOT NULL DEFAULT 0,
  translation INT NOT NULL DEFAULT 0
);

-- RLS: anyone can read, only service_role can write
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily_usage"
  ON daily_usage FOR SELECT
  USING (true);

-- Atomically increment usage; returns new count or -1 if limit exceeded
CREATE OR REPLACE FUNCTION increment_usage(p_feature TEXT, p_limit INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_val INT;
  new_val INT;
BEGIN
  -- Upsert today's row
  INSERT INTO daily_usage (usage_date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (usage_date) DO NOTHING;

  -- Lock the row
  IF p_feature = 'level_check' THEN
    SELECT level_check INTO current_val FROM daily_usage WHERE usage_date = CURRENT_DATE FOR UPDATE;
  ELSIF p_feature = 'workbook' THEN
    SELECT workbook INTO current_val FROM daily_usage WHERE usage_date = CURRENT_DATE FOR UPDATE;
  ELSIF p_feature = 'translation' THEN
    SELECT translation INTO current_val FROM daily_usage WHERE usage_date = CURRENT_DATE FOR UPDATE;
  ELSE
    RETURN -1;
  END IF;

  IF current_val >= p_limit THEN
    RETURN -1;
  END IF;

  new_val := current_val + 1;

  IF p_feature = 'level_check' THEN
    UPDATE daily_usage SET level_check = new_val WHERE usage_date = CURRENT_DATE;
  ELSIF p_feature = 'workbook' THEN
    UPDATE daily_usage SET workbook = new_val WHERE usage_date = CURRENT_DATE;
  ELSIF p_feature = 'translation' THEN
    UPDATE daily_usage SET translation = new_val WHERE usage_date = CURRENT_DATE;
  END IF;

  RETURN new_val;
END;
$$;

-- Get today's usage (returns 0,0,0 if no row exists yet)
CREATE OR REPLACE FUNCTION get_daily_usage()
RETURNS TABLE(level_check INT, workbook INT, translation INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(d.level_check, 0),
    COALESCE(d.workbook, 0),
    COALESCE(d.translation, 0)
  FROM daily_usage d
  WHERE d.usage_date = CURRENT_DATE;

  -- If no row exists, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0;
  END IF;
END;
$$;
