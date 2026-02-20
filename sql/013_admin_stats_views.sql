-- Admin Stats Views
-- These views are accessed via service_role key, so no RLS needed.

-- User statistics
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT
  (SELECT count(*) FROM auth.users) AS total_users,
  (SELECT count(*) FROM auth.users WHERE created_at >= date_trunc('month', now())) AS new_this_month,
  (SELECT count(*) FROM profiles WHERE language_preference = 'en') AS english_learners,
  (SELECT count(*) FROM profiles WHERE language_preference = 'ja') AS japanese_learners;

-- Assessment statistics
CREATE OR REPLACE VIEW admin_assessment_stats AS
SELECT
  count(*) AS total_assessments,
  count(*) FILTER (WHERE language = 'english') AS english_assessments,
  count(*) FILTER (WHERE language = 'japanese') AS japanese_assessments,
  count(*) FILTER (WHERE mode = 'text') AS text_mode,
  count(*) FILTER (WHERE mode = 'voice') AS voice_mode,
  count(*) FILTER (WHERE mode = 'both') AS both_mode
FROM assessment_results;

-- Subscription statistics
CREATE OR REPLACE VIEW admin_subscription_stats AS
SELECT
  count(*) FILTER (WHERE status IN ('active', 'trialing')) AS active_subscriptions,
  count(*) FILTER (WHERE status = 'canceled' OR cancel_at_period_end = true) AS canceled_subscriptions
FROM subscriptions;

-- Workbook statistics
CREATE OR REPLACE VIEW admin_workbook_stats AS
SELECT
  count(*) AS total_workbooks,
  count(*) FILTER (WHERE status = 'completed') AS completed_workbooks,
  CASE
    WHEN count(*) > 0
    THEN round(count(*) FILTER (WHERE status = 'completed')::numeric / count(*)::numeric * 100, 1)
    ELSE 0
  END AS completion_rate
FROM workbooks;

-- Daily signups (last 30 days) for chart
CREATE OR REPLACE VIEW admin_daily_signups AS
SELECT
  d::date AS date,
  coalesce(count(u.id), 0) AS signups
FROM generate_series(
  now() - interval '29 days',
  now(),
  interval '1 day'
) AS d
LEFT JOIN auth.users u ON u.created_at::date = d::date
GROUP BY d::date
ORDER BY d::date;
