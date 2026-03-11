-- Extend purchases table for Payment Link workbook purchases (no user_id required)
ALTER TABLE purchases ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS customer_name TEXT;
