import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/index';
import type { AvailableSlot } from '../../lib/booking/types';
import BookingForm from './BookingForm';

interface Props {
  mode: 'member' | 'guest';
  duration?: 60 | 90;
  bookingType?: 'public' | 'personal';
  onGuestBook?: (slot: AvailableSlot) => void;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateStr));
}

function formatTime(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatWeekRange(monday: Date, lang: string): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${fmt.format(monday)} – ${fmt.format(sunday)}`;
}

export default function BookingCalendar({ mode, duration = 60, bookingType = 'public', onGuestBook }: Props) {
  const { t, lang } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const weekStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      const res = await fetch(`/api/booking/available-slots?week=${weekStr}&weeks=1&duration=${duration}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch (err) {
      console.error(err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [weekStart, duration]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    const today = getMonday(new Date());
    if (prev >= today) setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    const maxWeek = new Date();
    maxWeek.setDate(maxWeek.getDate() + 28);
    if (next <= maxWeek) setWeekStart(next);
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    if (slot.is_booked) return;
    if (new Date(slot.slot_start) < new Date()) return;

    if (mode === 'guest' && onGuestBook) {
      onGuestBook(slot);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleBookingConfirmed = () => {
    setSelectedSlot(null);
    setBookingSuccess(true);
    fetchSlots();
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  // Group slots by local date
  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    const dateKey = toLocalDateKey(slot.slot_start);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  // Generate 7 days starting from weekStart (local)
  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    weekDays.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const isCurrentWeek = getMonday(new Date()).getTime() === weekStart.getTime();

  return (
    <div>
      {/* Success message */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
          {t('booking.success.title')}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevWeek}
          disabled={isCurrentWeek}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {t('booking.prevWeek')}
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {formatWeekRange(weekStart, lang)}
        </h2>
        <button
          onClick={handleNextWeek}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-orange-50 transition-colors"
        >
          {t('booking.nextWeek')}
        </button>
      </div>

      {/* Timezone notice */}
      <p className="text-xs text-gray-400 text-center mb-4">
        {t('booking.timezone')}
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📅</p>
          <p>{t('booking.noSlots')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {weekDays.map((dateKey) => {
            const daySlots = slotsByDate[dateKey] || [];
            const isPast = new Date(dateKey + 'T23:59:59') < new Date();

            return (
              <div key={dateKey} className={`${isPast ? 'opacity-40' : ''}`}>
                <div className="text-center text-sm font-medium text-gray-600 mb-2 pb-2 border-b border-gray-100">
                  {formatDate(dateKey + 'T12:00:00', lang)}
                </div>
                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <div className="text-center text-xs text-gray-300 py-4">—</div>
                  ) : (
                    daySlots.map((slot) => {
                      const slotPast = new Date(slot.slot_start) < new Date();
                      const available = !slot.is_booked && !slotPast;

                      return (
                        <button
                          key={slot.slot_start}
                          onClick={() => handleSlotClick(slot)}
                          disabled={!available}
                          className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                            available
                              ? 'bg-orange-50 border-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 cursor-pointer'
                              : slot.is_booked
                                ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                                : 'bg-gray-50 border border-gray-200 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {formatTime(slot.slot_start, lang)}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {slots.length > 0 && (
        <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-100 border-2 border-orange-300" />
            {t('booking.available')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            {t('booking.booked')}
          </span>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          mode={mode}
          bookingType={bookingType}
          onConfirm={handleBookingConfirmed}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
