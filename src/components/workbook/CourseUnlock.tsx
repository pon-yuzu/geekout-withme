import { useState, useEffect } from 'react';
import type { PaidCourse } from '../../lib/workbook/paid-courses';

const STORAGE_PREFIX = 'uchiwai_course_access_';
const PURCHASED_AT_PREFIX = 'uchiwai_course_purchased_at_';
const HAS_ACCOUNT_PREFIX = 'uchiwai_course_has_account_';

function hasAccess(courseId: string): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(STORAGE_PREFIX + courseId);
  if (val !== 'true' && val !== 'granted') return false;

  // Check expiration if purchased_at exists
  const purchasedAt = localStorage.getItem(PURCHASED_AT_PREFIX + courseId);
  if (purchasedAt) {
    const hasAccount = localStorage.getItem(HAS_ACCOUNT_PREFIX + courseId) === 'true';
    const maxDays = hasAccount ? 365 : 183;
    const expiry = new Date(purchasedAt);
    expiry.setDate(expiry.getDate() + maxDays);
    if (new Date() > expiry) {
      localStorage.removeItem(STORAGE_PREFIX + courseId);
      localStorage.removeItem(PURCHASED_AT_PREFIX + courseId);
      return false;
    }
  }
  return true;
}

function grantAccess(courseId: string): void {
  localStorage.setItem(STORAGE_PREFIX + courseId, 'true');
}

export default function CourseUnlock({ course }: { course: PaidCourse }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(hasAccess(course.id));
  }, [course.id]);

  function handleUnlock() {
    if (passwordInput.trim().toUpperCase() === course.password.toUpperCase()) {
      grantAccess(course.id);
      setUnlocked(true);
      setShowModal(false);
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <>
      {/* Unlock bar */}
      {!unlocked && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">🔒 サンプル以外のDayは購入後にアクセスできます</span>
          </div>
          <div className="flex gap-2">
            <a
              href={course.stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
            >
              ¥{course.price.toLocaleString()} で購入
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors"
            >
              🔐 パスワード入力
            </button>
          </div>
        </div>
      )}

      {unlocked && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center">
          <span className="text-sm text-green-700 font-medium">✓ 全30日アクセス可能</span>
        </div>
      )}

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {Array.from({ length: course.totalDays }, (_, i) => {
          const dayNum = i + 1;
          const isSample = course.sampleDays.includes(dayNum);
          const isAccessible = isSample || unlocked;

          if (isAccessible) {
            return (
              <a
                key={dayNum}
                href={`${course.baseUrl}/day${dayNum}.html`}
                className={`relative flex flex-col items-center p-1.5 sm:p-3 md:p-4 bg-white border rounded-lg sm:rounded-xl hover:shadow-md transition-all text-center group ${
                  isSample
                    ? 'border-blue-200 hover:border-blue-400'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {isSample && (
                  <div className="absolute -top-1 -right-1 sm:top-1 sm:right-1 px-1 sm:px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[8px] sm:text-[10px] font-medium">
                    FREE
                  </div>
                )}
                <span className="text-base sm:text-2xl mb-0.5 sm:mb-2">📖</span>
                <span className="text-[10px] sm:text-xs font-bold text-orange-500 group-hover:text-orange-600">
                  Day {dayNum}
                </span>
              </a>
            );
          }

          return (
            <div
              key={dayNum}
              className="relative flex flex-col items-center p-1.5 sm:p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl text-center opacity-50 cursor-not-allowed"
            >
              <span className="text-base sm:text-2xl mb-0.5 sm:mb-2">🔒</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-400">Day {dayNum}</span>
            </div>
          );
        })}
      </div>

      {/* Password Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">🔐 コースを解錠する</h3>
            <p className="text-sm text-gray-500 mb-4">
              購入完了ページに表示されたパスワードを入力してください
            </p>
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="パスワードを入力"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-orange-400 ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 mb-3">✗ パスワードが違います</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setShowModal(false); setError(false); setPasswordInput(''); }}
                className="flex-1 text-sm text-gray-500 border border-gray-200 py-2 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 text-sm bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors"
              >
                解錠する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
