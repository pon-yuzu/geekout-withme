-- Add language column to workbooks table
-- Supports 'english' (default for existing records) and 'japanese'
ALTER TABLE public.workbooks
  ADD COLUMN language text NOT NULL DEFAULT 'english';
