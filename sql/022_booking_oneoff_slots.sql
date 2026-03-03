-- 022_booking_oneoff_slots.sql — One-off (single-date) booking slots

-- ============================================================
-- 1. booking_oneoff_slots — 単発スロット（特定日付 + 時間帯）
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_oneoff_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date     date NOT NULL,
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  duration_min  int  NOT NULL DEFAULT 60,
  buffer_min    int  NOT NULL DEFAULT 10,
  slot_type     text NOT NULL DEFAULT 'both'
                  CHECK (slot_type IN ('single', 'personal', 'both')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oneoff_slots_date
  ON booking_oneoff_slots(slot_date) WHERE is_active = true;

-- ============================================================
-- 2. RLS
-- ============================================================

ALTER TABLE booking_oneoff_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oneoff_slots_select_all"
  ON booking_oneoff_slots FOR SELECT USING (true);
CREATE POLICY "oneoff_slots_service_role_all"
  ON booking_oneoff_slots FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 3. Trigger
-- ============================================================

CREATE TRIGGER booking_oneoff_slots_updated_at
  BEFORE UPDATE ON booking_oneoff_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 4. Updated get_available_slots() — リピート + 単発の両方を返す
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
  v_range_end date;
BEGIN
  v_range_end := p_week_start + (p_weeks * 7);

  -- ── Part 1: Recurring weekly rules ──
  FOR v_slot IN
    SELECT s.day_of_week, s.start_time, s.end_time,
           s.duration_min, s.buffer_min, s.slot_type
    FROM booking_slots s
    WHERE s.is_active = true
  LOOP
    FOR d IN 0 .. (p_weeks * 7 - 1) LOOP
      v_day := p_week_start + d;
      IF EXTRACT(DOW FROM v_day)::int = v_slot.day_of_week THEN
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

  -- ── Part 2: One-off slots ──
  FOR v_slot IN
    SELECT o.slot_date, o.start_time, o.end_time,
           o.duration_min, o.buffer_min, o.slot_type
    FROM booking_oneoff_slots o
    WHERE o.is_active = true
      AND o.slot_date >= p_week_start
      AND o.slot_date < v_range_end
      AND NOT EXISTS (
        SELECT 1 FROM booking_slot_overrides
        WHERE override_date = o.slot_date AND is_blocked = true
      )
  LOOP
    v_end_ts := v_slot.slot_date + v_slot.end_time;
    v_time_s := v_slot.slot_date + v_slot.start_time;
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
  END LOOP;
END;
$$;
