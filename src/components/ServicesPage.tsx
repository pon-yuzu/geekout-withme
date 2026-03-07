import { useState } from 'react';
import { useTranslation } from '../i18n/index';

interface Purchase {
  product_type: string;
  created_at: string;
}

interface Props {
  isLoggedIn: boolean;
  isPremium: boolean;
  purchases: Purchase[];
  hasLineSupport?: boolean;
}

const LINE_URL = 'https://lin.ee/9Nobyp8';

export default function ServicesPage({ isLoggedIn, isPremium, purchases, hasLineSupport = false }: Props) {
  const { t, lang } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  // Purchase state helpers

  const handleCheckout = async (productType: string) => {
    setLoading(productType);
    try {
      const res = await fetch('/api/create-service-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setLoading(null);
  };

  const handleSubscribe = async () => {
    setLoading('premium');
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
    setLoading(null);
  };

  const handleManage = async (key = 'premium') => {
    setLoading(key);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
    setLoading(null);
  };

  const handleLineSupportSubscribe = async () => {
    setLoading('line_support');
    try {
      const res = await fetch('/api/create-line-support-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('LINE support checkout error:', error);
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Free Trial Session - Top banner */}
      <a
        href="/free-session"
        className="block bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 md:p-8 text-white shadow-md hover:shadow-lg transition-shadow group"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl shrink-0">🌱</span>
          <div className="flex-1">
            <span className="inline-block text-xs font-bold px-2 py-0.5 bg-white/25 rounded-full border border-white/40 mb-1">
              {t('services.freeTrial.badge')}
            </span>
            <h3 className="text-xl font-bold">
              {t('services.freeTrial.title')}
            </h3>
            <p className="text-white/85 text-sm mt-1">
              {t('services.freeTrial.desc')}
            </p>
          </div>
          <span className="text-xl font-bold group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </a>

      {/* Community - Free */}
      <ServiceCard
        icon="💬"
        title={t('services.community.title')}
        desc={t('services.community.desc')}
        price={t('services.community.price')}
      >
        <a
          href="/community"
          className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
        >
          {t('services.community.cta')}
        </a>
      </ServiceCard>

      {/* Premium subscription - highlighted */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-5 md:p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-4 right-4">
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {t('services.premium.badge')}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">✨</span>
          <div>
            <h3 className="text-2xl font-bold">{t('services.premium.title')}</h3>
            <span className="text-orange-600 font-semibold line-through text-sm mr-2">{t('services.premium.price')}</span>
            <span className="text-green-600 font-bold">{t('services.premium.promoPrice')}</span>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{t('services.premium.desc')}</p>

        {!isLoggedIn ? (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('services.login')}
          </a>
        ) : isPremium ? (
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-semibold">{t('services.premium.active')}</span>
            <button
              onClick={() => handleManage('premium')}
              disabled={loading === 'premium'}
              className="px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              {loading === 'premium' ? t('services.loading') : t('services.premium.manage')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading === 'premium'}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading === 'premium' ? t('services.loading') : t('services.premium.cta')}
          </button>
        )}
      </div>

      {/* Paid single-purchase services */}
      <ServiceCard
        icon="📘"
        title={t('services.workbook.title')}
        desc={t('services.workbook.desc')}
        price={t('services.workbook.price')}
      >
        {!isLoggedIn ? (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('services.login')}
          </a>
        ) : (
          <button
            onClick={() => handleCheckout('workbook')}
            disabled={loading === 'workbook'}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading === 'workbook' ? t('services.loading') : t('services.workbook.cta')}
          </button>
        )}
      </ServiceCard>

      {/* LINE Unlimited Support */}
      <div className={`rounded-2xl p-5 md:p-8 shadow-sm ${
        hasLineSupport
          ? 'bg-gradient-to-br from-green-50 to-teal-50 border-2 border-teal-300'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📱</span>
          <div>
            <h3 className="text-xl font-bold">{t('services.lineSupport.title')}</h3>
            <span className="font-semibold text-teal-500">{t('services.lineSupport.price')}</span>
          </div>
          {hasLineSupport && (
            <span className="ml-auto bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('services.lineSupport.active')}
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-6">{t('services.lineSupport.desc')}</p>

        {!isLoggedIn ? (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-colors"
          >
            {t('services.login')}
          </a>
        ) : hasLineSupport ? (
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-semibold">{t('services.lineSupport.active')}</span>
            <button
              onClick={() => handleManage('line_support')}
              disabled={loading === 'line_support'}
              className="px-6 py-3 bg-white border border-gray-200 rounded-full font-semibold hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              {loading === 'line_support' ? t('services.loading') : t('services.lineSupport.manage')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleLineSupportSubscribe}
            disabled={loading === 'line_support'}
            className="px-6 py-3 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {loading === 'line_support' ? t('services.loading') : t('services.lineSupport.cta')}
          </button>
        )}
      </div>

      <ServiceCard
        icon="🌱"
        title={t('services.coaching.title')}
        desc={t('services.coaching.desc')}
        price={t('services.coaching.price')}
      >
        {!isLoggedIn ? (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('services.login')}
          </a>
        ) : (
          <a
            href="/booking"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('services.coaching.cta')}
          </a>
        )}
      </ServiceCard>

      {/* YouTube English Learning Consulting */}
      <ServiceCard
        icon="🎬"
        title={t('services.gowm.title')}
        desc={t('services.gowm.desc')}
        price={t('services.gowm.price')}
      >
        <a
          href="/gowm"
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
        >
          {t('services.gowm.cta')}
        </a>
      </ServiceCard>

      {/* High-tier inquiry services */}
      <ServiceCard
        icon="👤"
        title={t('services.personal.title')}
        desc={t('services.personal.desc')}
        muted
      >
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          {t('services.personal.cta')}
        </a>
      </ServiceCard>

      <ServiceCard
        icon="🎤"
        title={t('services.seminar.title')}
        desc={t('services.seminar.desc')}
        muted
      >
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          {t('services.seminar.cta')}
        </a>
      </ServiceCard>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  desc,
  price,
  muted,
  children,
}: {
  icon: string;
  title: string;
  desc: string;
  price?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-8 shadow-sm ${
        muted
          ? 'bg-gray-50 border border-gray-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          {price && (
            <span className={`font-semibold ${muted ? 'text-gray-500' : 'text-teal-500'}`}>
              {price}
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-600 mb-6">{desc}</p>
      {children}
    </div>
  );
}
