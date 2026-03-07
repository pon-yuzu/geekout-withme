import { useState } from 'react';
import { useTranslation } from '../../i18n/index';
import type { AvailableSlot } from '../../lib/booking/types';
import BookingCalendar from './BookingCalendar';

type Step = 'calendar' | 'form' | 'success';

interface UserInfo {
  id: string;
  email: string;
  displayName: string;
}

interface Props {
  focusParam?: string;
  user?: UserInfo | null;
}

export default function FreeTrialBooking({ focusParam, user }: Props) {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState<Step>('calendar');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [confirmedTime, setConfirmedTime] = useState('');

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusArea, setFocusArea] = useState(focusParam || '');
  const [sessionLang, setSessionLang] = useState('ja');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLoginLink, setShowLoginLink] = useState(false);

  const LIFE_WHEEL_CATEGORIES = [
    { value: 'health', label: t('freeTrial.category.health') },
    { value: 'money', label: t('freeTrial.category.money') },
    { value: 'career', label: t('freeTrial.category.career') },
    { value: 'relationships', label: t('freeTrial.category.relationships') },
    { value: 'time', label: t('freeTrial.category.time') },
    { value: 'living', label: t('freeTrial.category.living') },
    { value: 'mind', label: t('freeTrial.category.mind') },
    { value: 'vision', label: t('freeTrial.category.vision') },
  ];

  function formatDateTime(dateStr: string): string {
    return new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  }

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    setShowLoginLink(false);

    if (!user && password.length < 6) {
      setError(t('freeTrial.error.passwordMin'));
      setSubmitting(false);
      return;
    }

    // Build notes from focus area + session language + memo
    const notesParts: string[] = [];
    if (focusArea) {
      const cat = LIFE_WHEEL_CATEGORIES.find((c) => c.value === focusArea);
      notesParts.push(`【気になる項目】${cat?.label || focusArea}`);
    }
    notesParts.push(`【セッション言語】${sessionLang === 'ja' ? '日本語' : 'English'}`);
    if (memo.trim()) {
      notesParts.push(`【メモ】${memo.trim()}`);
    }
    const notesStr = notesParts.length > 0 ? notesParts.join('\n') : undefined;

    try {
      let res: Response;

      if (user) {
        res = await fetch('/api/booking/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slot_start: selectedSlot.slot_start,
            slot_end: selectedSlot.slot_end,
            booking_type: 'public',
            coupon_code: 'FREE_TRIAL',
            notes: notesStr,
          }),
        });
      } else {
        res = await fetch('/api/booking/create-with-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_name: guestName,
            guest_email: guestEmail,
            password,
            slot_start: selectedSlot.slot_start,
            slot_end: selectedSlot.slot_end,
            notes: notesStr,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'SLOT_TAKEN') {
          setError(t('freeTrial.error.slotTaken'));
          setStep('calendar');
        } else if (data.error === 'ALREADY_REGISTERED') {
          setError(t('freeTrial.error.alreadyRegistered'));
          setShowLoginLink(true);
        } else if (data.error === 'FREE_TRIAL_USED') {
          setError(t('freeTrial.error.freeTrialUsed'));
        } else {
          setError(data.error || t('freeTrial.error.generic'));
        }
        return;
      }

      setConfirmedTime(formatDateTime(selectedSlot.slot_start));
      setStep('success');
    } catch {
      setError(t('freeTrial.error.network'));
    } finally {
      setSubmitting(false);
    }
  };

  // --- Success screen ---
  if (step === 'success') {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('freeTrial.success.title')}
        </h2>
        <p className="text-gray-500 mb-2">
          {t('freeTrial.success.emailSent')}
        </p>
        <p className="text-lg font-medium text-orange-600 mb-6" suppressHydrationWarning>
          {confirmedTime}
        </p>

        {!user && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-gray-600 max-w-md mx-auto">
            <p className="font-medium text-orange-700 mb-1">{t('freeTrial.success.accountCreated')}</p>
            <p>
              {t('freeTrial.success.accountDesc')}
              <a href="/login" className="text-orange-600 underline ml-1">{t('freeTrial.success.loginLink')}</a>
            </p>
          </div>
        )}

        <a
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          {t('freeTrial.success.backHome')}
        </a>
      </div>
    );
  }

  // --- Form screen ---
  if (step === 'form' && selectedSlot) {
    return (
      <div className="max-w-md mx-auto">
        {/* Slot summary */}
        <div className="bg-orange-50 rounded-xl p-4 mb-6 space-y-1">
          <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
            <span className="text-gray-500">{t('freeTrial.form.dateTime')}</span>
            <span className="font-medium text-gray-800" suppressHydrationWarning>
              {formatDateTime(selectedSlot.slot_start)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('freeTrial.form.duration')}</span>
            <span className="font-medium text-gray-800">{t('freeTrial.form.durationValue')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('freeTrial.form.price')}</span>
            <span className="font-medium text-green-600">{t('freeTrial.form.priceValue')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logged-in user info */}
          {user ? (
            <div className="bg-orange-50 rounded-lg p-3 text-sm text-gray-600">
              <span className="font-medium">{user.displayName}</span>
              <span className="text-gray-400 ml-2">（{user.email}）</span>
              <span className="ml-1">{t('freeTrial.form.loggedInAs')}</span>
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('freeTrial.form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder={t('freeTrial.form.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('freeTrial.form.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  {t('freeTrial.form.passwordNote')}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('freeTrial.form.password')} <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs font-normal ml-1">{t('freeTrial.form.passwordMin')}</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t('freeTrial.form.passwordPlaceholder')}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  <a href="/terms" className="underline hover:text-gray-500">{t('freeTrial.form.terms')}</a>・
                  <a href="/privacy" className="underline hover:text-gray-500">{t('freeTrial.form.privacy')}</a>
                  {t('freeTrial.form.termsPrefix')}
                </p>
              </div>
            </>
          )}

          {/* Focus area dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('freeTrial.form.focusLabel')}
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none bg-white"
            >
              <option value="">{t('freeTrial.form.focusPlaceholder')}</option>
              {LIFE_WHEEL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Session language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('freeTrial.form.sessionLang')}
            </label>
            <select
              value={sessionLang}
              onChange={(e) => setSessionLang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none bg-white"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('freeTrial.form.memo')}
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('freeTrial.form.memoPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
              {showLoginLink && (
                <div className="mt-2">
                  <a href="/login" className="text-orange-600 underline font-medium">
                    {t('freeTrial.error.loginLink')}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('calendar')}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('freeTrial.form.back')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? t('freeTrial.form.submitting') : t('freeTrial.form.submit')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- Calendar screen ---
  return (
    <BookingCalendar
      mode="guest"
      duration={60}
      bookingType="public"
      onGuestBook={handleSlotSelect}
    />
  );
}
