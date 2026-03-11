import { createClient } from '@supabase/supabase-js';
import type { Booking, AvailableSlot, BookingCoupon, CouponValidationResult } from './types';

export function getServiceClient(locals: any) {
  const runtime = (locals as any).runtime;
  const supabaseUrl = runtime?.env?.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export async function getAvailableSlots(
  serviceSupabase: ReturnType<typeof createClient>,
  weekStart: string,
  weeks = 2,
  durationMin = 60,
  bufferMin = 0
): Promise<AvailableSlot[]> {
  const { data, error } = await serviceSupabase
    .rpc('get_available_slots', {
      p_week_start: weekStart,
      p_weeks: weeks,
      p_duration_min: durationMin,
      p_buffer_min: bufferMin,
    });
  if (error) throw new Error(error.message);
  return (data ?? []) as AvailableSlot[];
}

export async function getMyBookings(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, slot_start, slot_end, booking_type, status, coupon_id, amount_paid, zoom_url, notes, created_at')
    .eq('user_id', userId)
    .order('slot_start', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

// --- Coupon functions ---

export async function validateCoupon(
  serviceSupabase: ReturnType<typeof createClient>,
  code: string,
  userId?: string
): Promise<CouponValidationResult | null> {
  let query = serviceSupabase
    .from('booking_coupons')
    .select('id, code, label, user_id, price_yen, max_uses, used_count, expires_at')
    .eq('code', code)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  const { data: coupon, error } = await query;
  if (error || !coupon) return null;

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return null;

  // Check max uses
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return null;

  // Check user-bound coupon matches
  if (coupon.user_id && coupon.user_id !== userId) return null;

  return {
    coupon_id: coupon.id,
    price_yen: coupon.price_yen ?? 0,
    label: coupon.label,
  };
}

export async function getUserAutoCoupons(
  serviceSupabase: ReturnType<typeof createClient>,
  userId: string
): Promise<BookingCoupon[]> {
  const { data, error } = await serviceSupabase
    .from('booking_coupons')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('code', null);

  if (error) return [];

  // Filter valid coupons
  const now = new Date();
  return (data ?? []).filter((c: BookingCoupon) => {
    if (c.expires_at && new Date(c.expires_at) < now) return false;
    if (c.max_uses !== null && c.used_count >= c.max_uses) return false;
    return true;
  });
}

export async function useCoupon(
  serviceSupabase: ReturnType<typeof createClient>,
  couponId: string
): Promise<void> {
  const { error } = await serviceSupabase.rpc('increment_coupon_usage', { p_coupon_id: couponId });
  if (error) throw new Error(error.message);
}

// --- Booking creation ---

export async function createMemberBooking(
  serviceSupabase: ReturnType<typeof createClient>,
  userId: string,
  payload: {
    slot_start: string;
    slot_end: string;
    booking_type: string;
    status?: string;
    coupon_id?: string;
    amount_paid?: number | null;
    stripe_session_id?: string;
    notes?: string;
  }
): Promise<Booking> {
  // Check conflicts (confirmed + recent pending_payment)
  const { data: conflict } = await serviceSupabase
    .from('bookings')
    .select('id, status, created_at')
    .in('status', ['confirmed', 'pending_payment'])
    .lt('slot_start', payload.slot_end)
    .gt('slot_end', payload.slot_start)
    .limit(10);

  const validConflicts = (conflict ?? []).filter((b: any) => {
    if (b.status === 'confirmed') return true;
    // pending_payment older than 30min is stale
    if (b.status === 'pending_payment') {
      const age = Date.now() - new Date(b.created_at).getTime();
      return age < 30 * 60 * 1000;
    }
    return false;
  });

  if (validConflicts.length > 0) throw new Error('SLOT_TAKEN');

  const { data, error } = await serviceSupabase
    .from('bookings')
    .insert({
      user_id: userId,
      slot_start: payload.slot_start,
      slot_end: payload.slot_end,
      booking_type: payload.booking_type,
      status: payload.status ?? 'confirmed',
      coupon_id: payload.coupon_id ?? null,
      amount_paid: payload.amount_paid ?? null,
      stripe_session_id: payload.stripe_session_id ?? null,
      notes: payload.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function createGuestBooking(
  serviceSupabase: ReturnType<typeof createClient>,
  payload: {
    guest_name: string;
    guest_email: string;
    slot_start: string;
    slot_end: string;
    coupon_id?: string;
    amount_paid?: number | null;
    stripe_session_id?: string;
    status?: string;
    notes?: string;
  }
): Promise<Booking> {
  // Check conflicts
  const { data: conflict } = await serviceSupabase
    .from('bookings')
    .select('id, status, created_at')
    .in('status', ['confirmed', 'pending_payment'])
    .lt('slot_start', payload.slot_end)
    .gt('slot_end', payload.slot_start)
    .limit(10);

  const validConflicts = (conflict ?? []).filter((b: any) => {
    if (b.status === 'confirmed') return true;
    if (b.status === 'pending_payment') {
      const age = Date.now() - new Date(b.created_at).getTime();
      return age < 30 * 60 * 1000;
    }
    return false;
  });

  if (validConflicts.length > 0) throw new Error('SLOT_TAKEN');

  const { data, error } = await serviceSupabase
    .from('bookings')
    .insert({
      user_id: null,
      guest_name: payload.guest_name,
      guest_email: payload.guest_email,
      slot_start: payload.slot_start,
      slot_end: payload.slot_end,
      booking_type: 'public',
      status: payload.status ?? 'confirmed',
      coupon_id: payload.coupon_id ?? null,
      amount_paid: payload.amount_paid ?? null,
      stripe_session_id: payload.stripe_session_id ?? null,
      notes: payload.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Booking;
}

// --- Pending booking management ---

export async function confirmPendingBooking(
  serviceSupabase: ReturnType<typeof createClient>,
  stripeSessionId: string
): Promise<Booking | null> {
  const { data, error } = await serviceSupabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('stripe_session_id', stripeSessionId)
    .eq('status', 'pending_payment')
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Booking | null;
}

export async function cleanupStalePendingBookings(
  serviceSupabase: ReturnType<typeof createClient>
): Promise<number> {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data, error } = await serviceSupabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', thirtyMinAgo)
    .select('id');

  if (error) return 0;
  return data?.length ?? 0;
}

// --- Cancel ---

export async function cancelBooking(
  serviceSupabase: ReturnType<typeof createClient>,
  bookingId: string,
  requestUserId: string | null
): Promise<void> {
  let query = serviceSupabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .in('status', ['confirmed', 'pending_payment']);

  if (requestUserId) {
    query = query.eq('user_id', requestUserId);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
}

// --- Coupon CRUD (admin) ---

export async function listCoupons(
  serviceSupabase: ReturnType<typeof createClient>
): Promise<BookingCoupon[]> {
  const { data, error } = await serviceSupabase
    .from('booking_coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BookingCoupon[];
}

export async function createCoupon(
  serviceSupabase: ReturnType<typeof createClient>,
  coupon: {
    code?: string;
    label: string;
    user_id?: string;
    price_yen?: number | null;
    max_uses?: number | null;
    expires_at?: string | null;
  }
): Promise<BookingCoupon> {
  const { data, error } = await serviceSupabase
    .from('booking_coupons')
    .insert({
      code: coupon.code || null,
      label: coupon.label,
      user_id: coupon.user_id || null,
      price_yen: coupon.price_yen ?? null,
      max_uses: coupon.max_uses ?? null,
      expires_at: coupon.expires_at ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BookingCoupon;
}

export async function updateCoupon(
  serviceSupabase: ReturnType<typeof createClient>,
  couponId: string,
  updates: Partial<Pick<BookingCoupon, 'label' | 'price_yen' | 'max_uses' | 'expires_at' | 'is_active'>>
): Promise<BookingCoupon> {
  const { data, error } = await serviceSupabase
    .from('booking_coupons')
    .update(updates)
    .eq('id', couponId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BookingCoupon;
}

export async function deleteCoupon(
  serviceSupabase: ReturnType<typeof createClient>,
  couponId: string
): Promise<void> {
  const { error } = await serviceSupabase
    .from('booking_coupons')
    .delete()
    .eq('id', couponId);

  if (error) throw new Error(error.message);
}
