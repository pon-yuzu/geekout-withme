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
  const [weekStart, setWeekStart] = useState<Date | null>(null);

  useEffect(() => {
    setWeekStart(getMonday(new Date()));
  }, []);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!weekStart) return;
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
    if (!weekStart) return;
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    const today = getMonday(new Date());
    if (prev >= today) setWeekStart(prev);
  };

  const handleNextWeek = () => {
    if (!weekStart) return;
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

  if (!weekStart) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

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
        (() => {
          // Build a lookup: dateKey -> timeKey -> slot
          const slotMap = new Map<string, Map<string, AvailableSlot>>();
          const allTimeKeys = new Set<string>();

          for (const dateKey of weekDays) {
            const daySlots = slotsByDate[dateKey] || [];
            const timeMap = new Map<string, AvailableSlot>();
            for (const slot of daySlots) {
              const timeKey = formatTime(slot.slot_start, lang);
              timeMap.set(timeKey, slot);
              allTimeKeys.add(timeKey);
            }
            slotMap.set(dateKey, timeMap);
          }

          // Sort time rows chronologically using a reference slot's actual timestamp
          const timeKeysArr = [...allTimeKeys];
          const timeKeyOrder = new Map<string, number>();
          for (const slot of slots) {
            const tk = formatTime(slot.slot_start, lang);
            if (!timeKeyOrder.has(tk)) {
              timeKeyOrder.set(tk, new Date(slot.slot_start).getHours() * 60 + new Date(slot.slot_start).getMinutes());
            }
          }
          timeKeysArr.sort((a, b) => (timeKeyOrder.get(a) ?? 0) - (timeKeyOrder.get(b) ?? 0));

          // Filter days that have slots for mobile view
          const daysWithSlots = weekDays.filter(dk => (slotsByDate[dk] || []).length > 0);

          return (
            <>
              {/* ── Desktop: timetable grid (md+) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr>
                      <th className="py-2 px-2 text-xs text-gray-400 w-20"></th>
                      {weekDays.map((dateKey) => (
                        <th
                          key={dateKey}
                          className={`py-2 px-2 text-sm font-medium text-gray-600 border-b border-gray-100 ${
                            new Date(dateKey + 'T23:59:59') < new Date() ? 'opacity-40' : ''
                          }`}
                        >
                          {formatDate(dateKey + 'T12:00:00', lang)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeKeysArr.map((timeKey) => (
                      <tr key={timeKey}>
                        <td className="py-1.5 px-2 text-sm text-gray-400 font-medium whitespace-nowrap">
                          {timeKey}
                        </td>
                        {weekDays.map((dateKey) => {
                          const slot = slotMap.get(dateKey)?.get(timeKey);
                          if (!slot) {
                            return <td key={dateKey} className="py-1.5 px-2" />;
                          }
                          const slotPast = new Date(slot.slot_start) < new Date();
                          const available = !slot.is_booked && !slotPast;
                          const dayPast = new Date(dateKey + 'T23:59:59') < new Date();

                          return (
                            <td key={dateKey} className={`py-1.5 px-2 ${dayPast ? 'opacity-40' : ''}`}>
                              <button
                                onClick={() => handleSlotClick(slot)}
                                disabled={!available}
                                className={`w-full px-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                  available
                                    ? 'bg-orange-50 border-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 cursor-pointer'
                                    : slot.is_booked
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                                      : 'bg-gray-50 border border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                              >
                                {timeKey}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile: day-by-day cards (<md) ── */}
              <div className="md:hidden space-y-4">
                {daysWithSlots.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">{t('booking.noSlots')}</p>
                ) : (
                  daysWithSlots.map((dateKey) => {
                    const daySlots = slotsByDate[dateKey] || [];
                    const dayPast = new Date(dateKey + 'T23:59:59') < new Date();

                    return (
                      <div key={dateKey} className={`${dayPast ? 'opacity-40' : ''}`}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-100">
                          {formatDate(dateKey + 'T12:00:00', lang)}
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {daySlots.map((slot) => {
                            const timeKey = formatTime(slot.slot_start, lang);
                            const slotPast = new Date(slot.slot_start) < new Date();
                            const available = !slot.is_booked && !slotPast;

                            return (
                              <button
                                key={slot.slot_start}
                                onClick={() => handleSlotClick(slot)}
                                disabled={!available}
                                className={`px-2 py-3 rounded-xl text-sm font-medium transition-all ${
                                  available
                                    ? 'bg-orange-50 border-2 border-orange-300 text-orange-700 hover:bg-orange-100 active:bg-orange-100'
                                    : slot.is_booked
                                      ? 'bg-gray-100 border border-gray-200 text-gray-400 line-through'
                                      : 'bg-gray-50 border border-gray-200 text-gray-300'
                                }`}
                              >
                                {timeKey}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          );
        })()
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
