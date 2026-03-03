export type BookingType = 'public' | 'personal';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'pending_payment';

export interface BookingSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface OneoffSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface AvailableSlot {
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
}

export interface Booking {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  slot_start: string;
  slot_end: string;
  booking_type: BookingType | null;
  status: BookingStatus;
  coupon_id: string | null;
  amount_paid: number | null;
  stripe_session_id: string | null;
  zoom_url: string | null;
  zoom_meeting_id: string | null;
  google_event_id: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingCoupon {
  id: string;
  code: string | null;
  label: string;
  user_id: string | null;
  price_yen: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponValidationResult {
  coupon_id: string;
  price_yen: number;
  label: string;
}

export interface MemberBookingPayload {
  slot_start: string;
  slot_end: string;
  booking_type: BookingType;
  coupon_code?: string;
  notes?: string;
}

export interface GuestBookingPayload {
  guest_name: string;
  guest_email: string;
  slot_start: string;
  slot_end: string;
  coupon_code?: string;
  notes?: string;
}
