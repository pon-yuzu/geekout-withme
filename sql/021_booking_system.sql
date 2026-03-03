-- 021_booking_system.sql — Booking/reservation system (Phase 3 + 3b)

-- ============================================================
-- 1. booking_slots — 管理者が設定する週次の空き枠ルール
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week   int  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  duration_min  int  NOT NULL DEFAULT 50,
  buffer_min    int  NOT NULL DEFAULT 10,
  slot_type     text NOT NULL DEFAULT 'both'
                  CHECK (slot_type IN ('single', 'personal', 'both')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_slots_day
  ON booking_slots(day_of_week) WHERE is_active = true;

-- ============================================================
-- 2. bookings — 実際の予約レコード
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name       text,
  guest_email      text,
  CONSTRAINT booking_has_identity CHECK (
    user_id IS NOT NULL OR (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  ),

  slot_start       timestamptz NOT NULL,
  slot_end         timestamptz NOT NULL,
  CONSTRAINT slot_end_after_start CHECK (slot_end > slot_start),

  booking_type     text NOT NULL CHECK (booking_type IN ('single', 'personal')),

  status           text NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'cancelled', 'completed')),

  -- Phase 4: Google Calendar
  google_event_id  text,

  -- Phase 5: Zoom
  zoom_url         text,
  zoom_meeting_id  text,

  notes            text,
  admin_notes      text,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user
  ON bookings(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_slot_start
  ON bookings(slot_start);
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings(status, slot_start);
CREATE INDEX IF NOT EXISTS idx_bookings_guest
  ON bookings(guest_email) WHERE guest_email IS NOT NULL;

-- ============================================================
-- 3. booking_slot_overrides — 特定日のブロック
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_slot_overrides (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  override_date date NOT NULL,
  is_blocked    boolean NOT NULL DEFAULT true,
  reason        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_overrides_date
  ON booking_slot_overrides(override_date);

-- ============================================================
-- 4. RLS
-- ============================================================

ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slot_overrides ENABLE ROW LEVEL SECURITY;

-- booking_slots: public read, service_role write
CREATE POLICY "booking_slots_select_all"
  ON booking_slots FOR SELECT USING (true);
CREATE POLICY "booking_slots_service_role_all"
  ON booking_slots FOR ALL USING (auth.role() = 'service_role');

-- booking_slot_overrides: public read, service_role write
CREATE POLICY "overrides_select_all"
  ON booking_slot_overrides FOR SELECT USING (true);
CREATE POLICY "overrides_service_role_all"
  ON booking_slot_overrides FOR ALL USING (auth.role() = 'service_role');

-- bookings: own records only, service_role for everything
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_member"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND guest_name IS NULL AND guest_email IS NULL);
CREATE POLICY "bookings_service_role_all"
  ON bookings FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 5. Triggers
-- ============================================================

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER booking_slots_updated_at
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. get_available_slots() — 指定期間の空きスロットを生成
-- ============================================================

CREATE OR REPLACE FUNCTION get_available_slots(
  p_week_start date,
  p_weeks      int DEFAULT 2
)
RETURNS TABLE (
  slot_start   timestamptz,
  slot_end     timestamptz,
  slot_type    text,
  is_booked    boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot    record;
  v_day     date;
  v_time_s  timestamptz;
  v_time_e  timestamptz;
  v_end_ts  timestamptz;
BEGIN
  FOR v_slot IN
    SELECT s.day_of_week, s.start_time, s.end_time,
           s.duration_min, s.buffer_min, s.slot_type
    FROM booking_slots s
    WHERE s.is_active = true
  LOOP
    FOR d IN 0 .. (p_weeks * 7 - 1) LOOP
      v_day := p_week_start + d;
      IF EXTRACT(DOW FROM v_day)::int = v_slot.day_of_week THEN
        -- skip blocked dates
        IF NOT EXISTS (
          SELECT 1 FROM booking_slot_overrides
          WHERE override_date = v_day AND is_blocked = true
        ) THEN
          v_end_ts := v_day + v_slot.end_time;
          v_time_s := v_day + v_slot.start_time;
          LOOP
            v_time_e := v_time_s + (v_slot.duration_min || ' minutes')::interval;
            EXIT WHEN v_time_e > v_end_ts;

            slot_start := v_time_s;
            slot_end   := v_time_e;
            slot_type  := v_slot.slot_type;
            is_booked  := EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.status = 'confirmed'
                AND b.slot_start < v_time_e
                AND b.slot_end   > v_time_s
            );
            RETURN NEXT;

            v_time_s := v_time_e + (v_slot.buffer_min || ' minutes')::interval;
          END LOOP;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- ============================================================
-- 7. Seed: 初期スロット（月水金 UTC 05:00-08:00 = JST 14:00-17:00）
-- ============================================================

INSERT INTO booking_slots (day_of_week, start_time, end_time, duration_min, buffer_min, slot_type) VALUES
  (1, '05:00', '08:00', 50, 10, 'both'),
  (3, '05:00', '08:00', 50, 10, 'both'),
  (5, '05:00', '08:00', 50, 10, 'both')
ON CONFLICT DO NOTHING;
