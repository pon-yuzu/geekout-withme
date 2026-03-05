-- 029: Add reminder tracking columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false;
