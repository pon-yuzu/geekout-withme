-- Add adjustment_notes column to student_configs for coach feedback on generation
ALTER TABLE student_configs ADD COLUMN IF NOT EXISTS adjustment_notes TEXT DEFAULT NULL;
