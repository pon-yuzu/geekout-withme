-- 020b_lesson_archive.sql — Lesson archive (file storage for personal tier students)

-- ============================================================
-- 1. lesson_files table
-- ============================================================

CREATE TABLE IF NOT EXISTS lesson_files (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_by     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name       text NOT NULL,
  storage_path    text NOT NULL,
  file_type       text NOT NULL CHECK (file_type IN ('image', 'pdf')),
  file_size_bytes int NOT NULL DEFAULT 0,
  session_date    date,
  memo            text,
  is_pinned       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_files_student ON lesson_files(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_files_pinned ON lesson_files(student_id, is_pinned) WHERE is_pinned = true;

-- ============================================================
-- 2. RLS Policies
-- ============================================================

ALTER TABLE lesson_files ENABLE ROW LEVEL SECURITY;

-- Students can view their own files
CREATE POLICY "Students can view own files"
  ON lesson_files FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert files for themselves
CREATE POLICY "Students can upload own files"
  ON lesson_files FOR INSERT
  WITH CHECK (auth.uid() = student_id AND auth.uid() = uploaded_by);

-- Students can delete files they uploaded
CREATE POLICY "Students can delete own uploads"
  ON lesson_files FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Service role can do everything (admin operations)
CREATE POLICY "Service role manages lesson files"
  ON lesson_files FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 3. Storage bucket (run in Supabase dashboard or via API)
-- Note: Supabase Storage bucket creation is done via dashboard.
-- Bucket name: lesson-archive
-- Public: false (private, signed URLs)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
-- ============================================================
