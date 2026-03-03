-- 023_booking_service_coupon.sql — 予約システム再設計: クーポン + Stripe決済 + スロット簡素化

-- ============================================================
-- 1. booking_coupons — クーポン管理
-- ============================================================

CREATE TABLE IF NOT EXISTS booking_coupons (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text UNIQUE,                                    -- NULL = ユーザー紐付け型（自動適用）
  label        text NOT NULL,                                  -- 管理用ラベル
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = コード入力型
  price_yen    int,                                            -- 適用後の最終価格（NULL = 無料 ¥0）
  max_uses     int,                                            -- NULL = 無制限
  used_count   int NOT NULL DEFAULT 0,
  expires_at   timestamptz,                                    -- NULL = 期限なし
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON booking_coupons(code) WHERE code IS NOT NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_user ON booking_coupons(user_id) WHERE user_id IS NOT NULL AND is_active = true;

-- ============================================================
-- 2. RLS for booking_coupons
-- ============================================================

ALTER TABLE booking_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_service_role_all"
  ON booking_coupons FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "coupons_select_own"
  ON booking_coupons FOR SELECT
  USING (user_id = auth.uid() AND is_active = true);

-- ============================================================
-- 3. ALTER bookings — 新カラム追加 + ステータス拡張
-- ============================================================

-- booking_type の NOT NULL 制約を外す（既存データ保持）
ALTER TABLE bookings ALTER COLUMN booking_type DROP NOT NULL;

-- 新カラム追加
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES booking_coupons(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid int;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- ステータスに pending_payment を追加
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_check;
-- PostgreSQL の CHECK 制約名は自動生成されることがあるので両方試す
DO $$
BEGIN
  -- 既存の status CHECK 制約を特定して削除
  EXECUTE (
    SELECT 'ALTER TABLE bookings DROP CONSTRAINT ' || conname
    FROM pg_constraint
    WHERE conrelid = 'bookings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%'
    LIMIT 1
  );
EXCEPTION WHEN OTHERS THEN
  NULL; -- 制約がない場合はスキップ
END;
$$;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending_payment'));

-- booking_type に 'public' を追加
DO $$
BEGIN
  EXECUTE (
    SELECT 'ALTER TABLE bookings DROP CONSTRAINT ' || conname
    FROM pg_constraint
    WHERE conrelid = 'bookings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%booking_type%'
    LIMIT 1
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check
  CHECK (booking_type IN ('single', 'personal', 'public'));

-- stripe_session_id のインデックス
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session
  ON bookings(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

-- ============================================================
-- 4. ALTER booking_slots — duration/buffer/type を除去
-- ============================================================

ALTER TABLE booking_slots DROP COLUMN IF EXISTS duration_min;
ALTER TABLE booking_slots DROP COLUMN IF EXISTS buffer_min;
ALTER TABLE booking_slots DROP COLUMN IF EXISTS slot_type;

-- ============================================================
-- 5. ALTER booking_oneoff_slots — duration/buffer/type を除去
-- ============================================================

ALTER TABLE booking_oneoff_slots DROP COLUMN IF EXISTS duration_min;
ALTER TABLE booking_oneoff_slots DROP COLUMN IF EXISTS buffer_min;
ALTER TABLE booking_oneoff_slots DROP COLUMN IF EXISTS slot_type;

-- ============================================================
-- 6. increment_coupon_usage() — クーポン使用回数をアトミックにインクリメント
-- ============================================================

CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE booking_coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
END;
$$;

-- ============================================================
-- 7. get_available_slots() — duration/buffer をパラメータ化
-- ============================================================

CREATE OR REPLACE FUNCTION get_available_slots(
  p_week_start   date,
  p_weeks        int DEFAULT 2,
  p_duration_min int DEFAULT 60,
  p_buffer_min   int DEFAULT 10
)
RETURNS TABLE (
  slot_start   timestamptz,
  slot_end     timestamptz,
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
  v_duration interval;
  v_buffer   interval;
BEGIN
  v_range_end := p_week_start + (p_weeks * 7);
  v_duration  := (p_duration_min || ' minutes')::interval;
  v_buffer    := (p_buffer_min || ' minutes')::interval;

  -- ── Part 1: Recurring weekly rules ──
  FOR v_slot IN
    SELECT s.day_of_week, s.start_time, s.end_time
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
            v_time_e := v_time_s + v_duration;
            EXIT WHEN v_time_e > v_end_ts;

            slot_start := v_time_s;
            slot_end   := v_time_e;
            is_booked  := EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.status IN ('confirmed', 'pending_payment')
                AND (b.status != 'pending_payment' OR b.created_at > now() - interval '30 minutes')
                AND b.slot_start < v_time_e
                AND b.slot_end   > v_time_s
            );
            RETURN NEXT;

            v_time_s := v_time_e + v_buffer;
          END LOOP;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- ── Part 2: One-off slots ──
  FOR v_slot IN
    SELECT o.slot_date, o.start_time, o.end_time
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
      v_time_e := v_time_s + v_duration;
      EXIT WHEN v_time_e > v_end_ts;

      slot_start := v_time_s;
      slot_end   := v_time_e;
      is_booked  := EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.status IN ('confirmed', 'pending_payment')
          AND (b.status != 'pending_payment' OR b.created_at > now() - interval '30 minutes')
          AND b.slot_start < v_time_e
          AND b.slot_end   > v_time_s
      );
      RETURN NEXT;

      v_time_s := v_time_e + v_buffer;
    END LOOP;
  END LOOP;
END;
$$;
