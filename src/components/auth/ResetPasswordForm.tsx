import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { useTranslation } from '../../i18n/index';

export default function ResetPasswordForm() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and establishes a session. We listen for that event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('resetPassword.tooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.mismatch'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('resetPassword.done.title')}</h1>
        <p className="text-gray-500 mb-6">{t('resetPassword.done.desc')}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          {t('resetPassword.done.button')}
        </a>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <p className="text-gray-500">{t('resetPassword.verifying')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-center mb-2 text-orange-500">
        {t('resetPassword.title')}
      </h1>
      <p className="text-gray-500 text-center mb-8">
        {t('resetPassword.subtitle')}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
            {t('resetPassword.newPassword')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('resetPassword.newPasswordPlaceholder')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
            {t('resetPassword.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('resetPassword.updating') : t('resetPassword.submit')}
        </button>
      </form>
    </div>
  );
}
