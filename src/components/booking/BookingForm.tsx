import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';
import type { AvailableSlot, BookingType, CouponValidationResult } from '../../lib/booking/types';
import TurnstileWidget from '../TurnstileWidget';

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '';

interface Props {
  slot: AvailableSlot;
  mode: 'member' | 'guest';
  bookingType?: BookingType;
  onConfirm: () => void;
  onCancel: () => void;
}

interface AutoCoupon {
  id: string;
  label: string;
  price_yen: number | null;
}

function formatDateTime(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getDurationMin(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

const DEFAULT_PRICE = 10000;

export default function BookingForm({ slot, mode, bookingType = 'public', onConfirm, onCancel }: Props) {
  const { t, lang } = useTranslation();
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [autoCoupon, setAutoCoupon] = useState<AutoCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const isPublic = bookingType === 'public';
  const isPersonal = bookingType === 'personal';

  // Determine final price
  let price = isPersonal ? 0 : DEFAULT_PRICE;
  if (isPublic && autoCoupon) {
    price = autoCoupon.price_yen ?? 0;
  }
  if (isPublic && appliedCoupon) {
    price = appliedCoupon.price_yen;
  }

  // Fetch auto coupons for logged-in member on public booking
  useEffect(() => {
    if (mode !== 'member' || !isPublic) return;
    (async () => {
      try {
        const res = await fetch('/api/booking/user-coupons');
        if (res.ok) {
          const data = await res.json();
          if (data.coupons?.length > 0) {
            const c = data.coupons[0];
            setAutoCoupon({
              id: c.id,
              label: c.label,
              price_yen: c.price_yen,
            });
          }
        }
      } catch {}
    })();
  }, [mode, isPublic]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    setCouponError('');
    try {
      const res = await fetch('/api/booking/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          coupon_id: data.coupon_id,
          price_yen: data.price_yen,
          label: data.label,
        });
        setCouponError('');
      } else {
        setCouponError(lang === 'ja' ? 'クーポンが無効です' : 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError(lang === 'ja' ? 'エラーが発生しました' : 'Error validating coupon');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let res: Response;

      if (mode === 'guest') {
        res = await fetch('/api/booking/create-guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_name: guestName,
            guest_email: guestEmail,
            slot_start: slot.slot_start,
            slot_end: slot.slot_end,
            coupon_code: appliedCoupon ? couponCode.trim() : undefined,
            notes: notes || undefined,
            turnstileToken,
          }),
        });
      } else {
        res = await fetch('/api/booking/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_start: slot.slot_start,
            slot_end: slot.slot_end,
            booking_type: bookingType,
            coupon_code: appliedCoupon ? couponCode.trim() : undefined,
            notes: notes || undefined,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'SLOT_TAKEN') {
          setError(t('booking.form.slotTaken'));
        } else {
          setError(data.error || 'Failed to create booking');
        }
        return;
      }

      const data = await res.json();

      // If there's a checkout_url, redirect to Stripe
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      // Direct confirmation (personal or free coupon)
      onConfirm();
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const duration = getDurationMin(slot.slot_start, slot.slot_end);

  // Submit button label
  let submitLabel: string;
  if (isPersonal || price === 0) {
    submitLabel = t('booking.form.confirm');
  } else {
    submitLabel = lang === 'ja'
      ? `お支払いに進む (¥${price.toLocaleString()})`
      : `Proceed to payment (¥${price.toLocaleString()})`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {t('booking.form.title')}
        </h3>

        <div className="bg-orange-50 rounded-xl p-4 mb-4 space-y-1">
          <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
            <span className="text-gray-500">{t('booking.form.dateTime')}</span>
            <span className="font-medium text-gray-800" suppressHydrationWarning>
              {formatDateTime(slot.slot_start, lang)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('booking.form.duration')}</span>
            <span className="font-medium text-gray-800">
              {duration}{lang === 'ja' ? '分' : ' min'}
            </span>
          </div>
          {isPublic && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{lang === 'ja' ? '料金' : 'Price'}</span>
              <span className="font-medium text-gray-800">
                {price === 0 ? (
                  <span className="text-green-600">{lang === 'ja' ? '無料' : 'Free'}</span>
                ) : (
                  <>
                    {(appliedCoupon || autoCoupon) && price < DEFAULT_PRICE && (
                      <span className="line-through text-gray-400 mr-2">¥{DEFAULT_PRICE.toLocaleString()}</span>
                    )}
                    ¥{price.toLocaleString()}
                  </>
                )}
              </span>
            </div>
          )}
          {isPersonal && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{lang === 'ja' ? '料金' : 'Price'}</span>
              <span className="font-medium text-green-600">{lang === 'ja' ? '契約内（無料）' : 'Included'}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest fields */}
          {mode === 'guest' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.guestName')}
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('booking.form.guestEmail')}
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
              </div>
            </>
          )}

          {/* Coupon section (public only) */}
          {isPublic && (
            <div className="space-y-2">
              {/* Auto coupon display */}
              {autoCoupon && !appliedCoupon && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm">
                  <span className="text-teal-700 font-medium">
                    {lang === 'ja' ? '自動適用: ' : 'Auto-applied: '}
                  </span>
                  <span className="text-teal-600">{autoCoupon.label}</span>
                  <span className="text-teal-500 ml-2">
                    → ¥{(autoCoupon.price_yen ?? 0).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Applied code coupon */}
              {appliedCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm flex justify-between items-center">
                  <div>
                    <span className="text-green-700 font-medium">{appliedCoupon.label}</span>
                    <span className="text-green-500 ml-2">
                      → ¥{appliedCoupon.price_yen.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    {lang === 'ja' ? '取消' : 'Remove'}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'ja' ? 'クーポンコード' : 'Coupon code'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={lang === 'ja' ? 'コードを入力' : 'Enter code'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplying || !couponCode.trim()}
                      className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                      {couponApplying ? '...' : (lang === 'ja' ? '適用' : 'Apply')}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-1">{couponError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('booking.form.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('booking.form.notesPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none resize-none"
            />
          </div>

          {mode === 'guest' && TURNSTILE_SITE_KEY && (
            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken('')}
            />
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('booking.form.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? '...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
