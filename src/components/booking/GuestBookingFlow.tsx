import { useState } from 'react';
import { useTranslation } from '../../i18n/index';
import type { AvailableSlot } from '../../lib/booking/types';
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';

type Step = 'calendar' | 'form' | 'success';

export default function GuestBookingFlow() {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState<Step>('calendar');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [confirmedTime, setConfirmedTime] = useState('');

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleConfirmed = () => {
    if (selectedSlot) {
      setConfirmedTime(
        new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(selectedSlot.slot_start))
      );
    }
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('booking.success.title')}
        </h2>
        <p className="text-gray-500 mb-2">{t('booking.success.detail')}</p>
        <p className="text-lg font-medium text-orange-600 mb-8" suppressHydrationWarning>
          {confirmedTime}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          {t('booking.success.backHome')}
        </a>
      </div>
    );
  }

  if (step === 'form' && selectedSlot) {
    return (
      <BookingForm
        slot={selectedSlot}
        mode="guest"
        onConfirm={handleConfirmed}
        onCancel={() => setStep('calendar')}
      />
    );
  }

  return (
    <div>
      <p className="text-center text-gray-500 text-sm mb-6">
        {t('booking.guestRequired')}
      </p>
      <BookingCalendar
        mode="guest"
        duration={60}
        bookingType="public"
        onGuestBook={handleSlotSelect}
      />
    </div>
  );
}
