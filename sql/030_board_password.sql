-- 030: Board password (合言葉) feature
ALTER TABLE boards ADD COLUMN IF NOT EXISTS password_hash text DEFAULT NULL;

CREATE TABLE IF NOT EXISTS board_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, board_id)
);

ALTER TABLE board_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own unlocks"
  ON board_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
  ON board_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
