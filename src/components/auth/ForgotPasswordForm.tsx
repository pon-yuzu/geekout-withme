import { useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { useTranslation } from '../../i18n/index';

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('forgotPassword.sent.title')}</h1>
        <p className="text-gray-500 mb-2">{t('forgotPassword.sent.desc')}</p>
        <p className="text-orange-500 font-medium mb-6">{email}</p>
        <p className="text-gray-400 text-sm mb-8">{t('forgotPassword.sent.descSuffix')}</p>
        <a href="/login" className="text-orange-500 hover:text-orange-400 transition-colors">
          {t('forgotPassword.backToLogin')}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-center mb-2 text-orange-500">
        {t('forgotPassword.title')}
      </h1>
      <p className="text-gray-500 text-center mb-8">
        {t('forgotPassword.subtitle')}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            {t('forgotPassword.email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('forgotPassword.emailPlaceholder')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('forgotPassword.sending') : t('forgotPassword.submit')}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm">
        <a href="/login" className="text-orange-500 hover:text-orange-400 transition-colors">
          {t('forgotPassword.backToLogin')}
        </a>
      </p>
    </div>
  );
}
