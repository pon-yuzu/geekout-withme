-- 020_board_access_tier.sql — Add access_tier to boards + Personal Members board

-- ============================================================
-- 1. Add access_tier column (null = all authenticated users)
-- ============================================================

ALTER TABLE boards
  ADD COLUMN IF NOT EXISTS access_tier text DEFAULT NULL
  CHECK (access_tier IS NULL OR access_tier IN ('premium', 'personal'));

-- ============================================================
-- 2. Personal Members board
-- ============================================================

INSERT INTO boards (slug, name_ja, name_en, description_ja, description_en, emoji, post_permission, sort_order, access_tier) VALUES
  ('personal-members', 'Personal Members', 'Personal Members', 'パーソナル会員専用の質問・相談ボード', 'Exclusive board for personal tier members', '🔑', 'all', 10, 'personal')
ON CONFLICT (slug) DO NOTHING;
