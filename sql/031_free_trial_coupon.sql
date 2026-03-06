-- Free Trial system coupon for life coaching sessions
-- Used by /booking/free-trial page (auto-applied, not user-entered)

INSERT INTO booking_coupons (code, label, price_yen, max_uses, used_count, is_active)
VALUES ('FREE_TRIAL', '初回無料体験', 0, 9999, 0, true);
