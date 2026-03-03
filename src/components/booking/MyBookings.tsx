import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';
import type { Booking } from '../../lib/booking/types';

function formatDateTime(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getDurationMin(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

export default function MyBookings() {
  const { t, lang } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/booking/my-bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm(t('booking.myBookings.cancelConfirm'))) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => (b.status === 'confirmed' || b.status === 'pending_payment') && new Date(b.slot_start) >= now
  );
  const past = bookings.filter(
    (b) => (b.status !== 'confirmed' && b.status !== 'pending_payment') || new Date(b.slot_start) < now
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('booking.myBookings')}</h1>
      </div>

      {/* Upcoming */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t('booking.myBookings.upcoming')}
      </h2>

      {upcoming.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 mb-8">
          <p className="text-3xl mb-2">📅</p>
          <p>{t('booking.myBookings.noUpcoming')}</p>
          <a
            href="/booking"
            className="inline-block mt-4 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            {t('booking.title')}
          </a>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {upcoming.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              lang={lang}
              t={t}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
              showCancel
            />
          ))}
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('booking.myBookings.past')}
          </h2>
          <div className="space-y-3 opacity-60">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                lang={lang}
                t={t}
                onCancel={handleCancel}
                cancelling={false}
                showCancel={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  lang,
  t,
  onCancel,
  cancelling,
  showCancel,
}: {
  booking: Booking;
  lang: string;
  t: (key: string) => string;
  onCancel: (id: string) => void;
  cancelling: boolean;
  showCancel: boolean;
}) {
  const duration = getDurationMin(booking.slot_start, booking.slot_end);

  const statusBadge = {
    confirmed: { text: t('booking.myBookings.status.confirmed'), color: 'bg-green-100 text-green-700' },
    pending_payment: { text: lang === 'ja' ? '支払い待ち' : 'Pending Payment', color: 'bg-yellow-100 text-yellow-700' },
    cancelled: { text: t('booking.myBookings.status.cancelled'), color: 'bg-red-100 text-red-500' },
    completed: { text: t('booking.myBookings.status.completed'), color: 'bg-gray-100 text-gray-500' },
  }[booking.status] ?? { text: booking.status, color: 'bg-gray-100 text-gray-500' };

  const typeBadge = booking.booking_type === 'personal'
    ? { text: t('booking.form.type.personal'), color: 'bg-teal-100 text-teal-700' }
    : { text: t('booking.form.type.public'), color: 'bg-orange-100 text-orange-700' };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="font-medium text-gray-800" suppressHydrationWarning>
          {formatDateTime(booking.slot_start, lang)}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">
          {duration}{lang === 'ja' ? '分' : ' min'}
          {booking.notes && ` — ${booking.notes}`}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.color}`}>
            {typeBadge.text}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
          {booking.amount_paid != null && booking.amount_paid > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
              ¥{booking.amount_paid.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 sm:flex-col">
        {booking.zoom_url && (
          <a
            href={booking.zoom_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors text-center"
          >
            {t('booking.myBookings.joinZoom')}
          </a>
        )}
        {showCancel && booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking.id)}
            disabled={cancelling}
            className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {t('booking.myBookings.cancel')}
          </button>
        )}
      </div>
    </div>
  );
}
