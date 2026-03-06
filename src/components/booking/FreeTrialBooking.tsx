import { useState } from 'react';
import type { AvailableSlot } from '../../lib/booking/types';
import BookingCalendar from './BookingCalendar';

const LIFE_WHEEL_CATEGORIES = [
  { value: 'health', label: '健康・体' },
  { value: 'money', label: 'お金' },
  { value: 'career', label: '仕事・キャリア' },
  { value: 'relationships', label: '人間関係' },
  { value: 'time', label: '自分の時間' },
  { value: 'living', label: '暮らし・環境' },
  { value: 'mind', label: '心・内面' },
  { value: 'vision', label: '将来・ビジョン' },
] as const;

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

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function FreeTrialBooking({ focusParam, user }: Props) {
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

    // Client-side password validation (guest only)
    if (!user && password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
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
        // Logged-in → use existing create.ts
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
        // Guest → create-with-signup
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
          setError('申し訳ありません。この時間枠は他の方に予約されました。別の時間をお選びください。');
          setStep('calendar');
        } else if (data.error === 'ALREADY_REGISTERED') {
          setError('このメールアドレスはすでに登録されています。ログインしてから予約してください。');
          setShowLoginLink(true);
        } else if (data.error === 'FREE_TRIAL_USED') {
          setError('無料体験セッションはお一人様1回限りです。');
        } else {
          setError(data.error || '予約の作成に失敗しました。もう一度お試しください。');
        }
        return;
      }

      setConfirmedTime(formatDateTime(selectedSlot.slot_start));
      setStep('success');
    } catch {
      setError('ネットワークエラーが発生しました。もう一度お試しください。');
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
          ご予約が確定しました！
        </h2>
        <p className="text-gray-500 mb-2">
          確認メールをお送りしました。Zoomリンクもメールに記載されています。
        </p>
        <p className="text-lg font-medium text-orange-600 mb-6" suppressHydrationWarning>
          {confirmedTime}
        </p>

        {!user && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-gray-600 max-w-md mx-auto">
            <p className="font-medium text-orange-700 mb-1">アカウントが作成されました</p>
            <p>
              ご入力のメールアドレスとパスワードで
              <a href="/login" className="text-orange-600 underline ml-1">ログイン</a>
              できます。予約管理や診断結果の確認にお使いください。
            </p>
          </div>
        )}

        <a
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          トップに戻る
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">日時</span>
            <span className="font-medium text-gray-800" suppressHydrationWarning>
              {formatDateTime(selectedSlot.slot_start)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">所要時間</span>
            <span className="font-medium text-gray-800">60分</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">料金</span>
            <span className="font-medium text-green-600">無料</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logged-in user info */}
          {user ? (
            <div className="bg-orange-50 rounded-lg p-3 text-sm text-gray-600">
              <span className="font-medium">{user.displayName}</span>
              <span className="text-gray-400 ml-2">（{user.email}）</span>
              <span className="ml-1">でご予約します</span>
            </div>
          ) : (
            <>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder="山田 花子"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
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
                  予約と同時に無料アカウントが作成されます。今後の予約管理や診断結果の確認にお使いいただけます。
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs font-normal ml-1">（6文字以上）</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="6文字以上"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  <a href="/terms" className="underline hover:text-gray-500">利用規約</a>・
                  <a href="/privacy" className="underline hover:text-gray-500">プライバシーポリシー</a>
                  に同意の上、予約してください。
                </p>
              </div>
            </>
          )}

          {/* Focus area dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              診断で一番気になった項目は？
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 outline-none bg-white"
            >
              <option value="">選択してください（任意）</option>
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
              セッション希望言語
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
              セッションで聞きたいこと、気になっていること
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="自由にお書きください（任意）"
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
                    ログインはこちら
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
              戻る
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? '予約中...' : '予約を確定する（無料）'}
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
