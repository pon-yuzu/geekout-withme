-- 018_boards.sql — Board (掲示板) feature tables, RLS, triggers, seed data

-- ============================================================
-- 1. Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS boards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name_ja     text NOT NULL,
  name_en     text NOT NULL,
  description_ja text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  emoji       text NOT NULL DEFAULT '💬',
  post_permission text NOT NULL DEFAULT 'all' CHECK (post_permission IN ('all', 'admin_only')),
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  like_count  int NOT NULL DEFAULT 0,
  reply_count int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_threads_board_updated ON threads(board_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  like_count  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replies_thread ON replies(thread_id, created_at ASC);

CREATE TABLE IF NOT EXISTS board_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('thread', 'reply')),
  target_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_board_likes_target ON board_likes(target_type, target_id);

CREATE TABLE IF NOT EXISTS board_translation_cache (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type     text NOT NULL CHECK (source_type IN ('thread_title', 'thread_body', 'reply')),
  source_id       uuid NOT NULL,
  target_language text NOT NULL,
  translated_text text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, source_type, target_language)
);

-- ============================================================
-- 2. RLS Policies
-- ============================================================

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_translation_cache ENABLE ROW LEVEL SECURITY;

-- boards: everyone can read
CREATE POLICY boards_select ON boards FOR SELECT USING (true);

-- threads: authenticated users can read, authors can insert
CREATE POLICY threads_select ON threads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY threads_insert ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);

-- replies: authenticated users can read, authors can insert
CREATE POLICY replies_select ON replies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY replies_insert ON replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- board_likes: authenticated users can read, own likes insert/delete
CREATE POLICY board_likes_select ON board_likes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY board_likes_insert ON board_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY board_likes_delete ON board_likes FOR DELETE USING (auth.uid() = user_id);

-- board_translation_cache: authenticated users can read (insert via service_role only)
CREATE POLICY translation_cache_select ON board_translation_cache FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. Triggers (SECURITY DEFINER functions)
-- ============================================================

-- Like count sync
CREATE OR REPLACE FUNCTION board_like_count_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  delta int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    delta := 1;
    IF NEW.target_type = 'thread' THEN
      UPDATE threads SET like_count = like_count + delta WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'reply' THEN
      UPDATE replies SET like_count = like_count + delta WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    delta := -1;
    IF OLD.target_type = 'thread' THEN
      UPDATE threads SET like_count = GREATEST(0, like_count + delta) WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'reply' THEN
      UPDATE replies SET like_count = GREATEST(0, like_count + delta) WHERE id = OLD.target_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_board_like_count
  AFTER INSERT OR DELETE ON board_likes
  FOR EACH ROW EXECUTE FUNCTION board_like_count_change();

-- Reply count sync + updated_at
CREATE OR REPLACE FUNCTION board_reply_count_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE threads
      SET reply_count = reply_count + 1,
          updated_at = now()
      WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE threads
      SET reply_count = GREATEST(0, reply_count - 1),
          updated_at = now()
      WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_board_reply_count
  AFTER INSERT OR DELETE ON replies
  FOR EACH ROW EXECUTE FUNCTION board_reply_count_change();

-- ============================================================
-- 4. Seed Data (8 boards)
-- ============================================================

INSERT INTO boards (slug, name_ja, name_en, description_ja, description_en, emoji, post_permission, sort_order) VALUES
  ('oshirase',     'Oshirase!',      'Oshirase!',      '運営からのお知らせです',                   'Official announcements from the team',         '📢', 'admin_only', 1),
  ('hajimemashite','Hajimemashite!',  'Hajimemashite!', '自己紹介をしましょう！',                   'Introduce yourself to the community!',          '👋', 'all',        2),
  ('shabero',      'Shabero!',        'Shabero!',       '英語で自由におしゃべり',                   'Free talk in English',                          '💬', 'all',        3),
  ('homete',       'Homete!',         'Homete!',        '頑張ったことを報告＆みんなでほめよう',       'Share your achievements and cheer each other on','🎉', 'all',        4),
  ('oshiete',      'Oshiete!',        'Oshiete!',       '英語の疑問をみんなに聞いてみよう',          'Ask the community your English questions',       '🙋', 'all',        5),
  ('osusume',      'Osusume!',        'Osusume!',       'おすすめの教材・動画・アプリなど',           'Share your favorite learning resources',         '⭐', 'all',        6),
  ('naoshite',     'Naoshite!',       'Naoshite!',      '英作文を投稿して添削してもらおう',           'Post your writing and get corrections',          '✏️', 'all',        7),
  ('dekitaraiina', 'Dekitara Ii Na!', 'Dekitara Ii Na!','こんな機能がほしい！リクエスト掲示板',       'Feature requests and suggestions',               '💡', 'all',        8)
ON CONFLICT (slug) DO NOTHING;
