import { useState } from 'react';
import { useTranslation } from '../i18n/index';

interface Props {
  isLoggedIn: boolean;
  isPremium: boolean;
}

export default function PricingCard({ isLoggedIn, isPremium }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setLoading(false);
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
      {isPremium && (
        <div className="absolute top-4 right-4 bg-green-500 text-xs font-bold px-3 py-1 rounded-full">
          {t('pricing.active')}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">✨</span>
        <div>
          <h2 className="text-2xl font-bold">{t('pricing.title')}</h2>
          <span className="text-teal-500 font-semibold">{t('pricing.price')}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        {t('pricing.desc')}
      </p>

      <ul className="space-y-3 mb-6">
        <li className="flex items-center gap-3">
          <span className="text-teal-500">✓</span>
          <span>{t('pricing.features.free')}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-teal-500">✓</span>
          <span>{t('pricing.features.voiceLounge')}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-teal-500">✓</span>
          <span>{t('pricing.features.studyPlans')}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-teal-500">✓</span>
          <span>{t('pricing.features.coaching')}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="text-teal-500">✓</span>
          <span>{t('pricing.features.events')}</span>
        </li>
      </ul>

      {!isLoggedIn ? (
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          {t('pricing.signInToSubscribe')}
        </a>
      ) : isPremium ? (
        <button
          onClick={handleManage}
          disabled={loading}
          className="px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          {loading ? t('pricing.loading') : t('pricing.manage')}
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? t('pricing.loading') : t('pricing.subscribe')}
        </button>
      )}
    </div>
  );
}
