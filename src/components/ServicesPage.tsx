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
}

const LINE_URL = 'https://lin.ee/9Nobyp8';

export default function ServicesPage({ isLoggedIn, isPremium, purchases }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  // Purchase state helpers
  const hasCoaching = purchases.some((p) => p.product_type === 'coaching');
  const recentCoaching = purchases.find((p) => {
    if (p.product_type !== 'coaching') return false;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return new Date(p.created_at) > threeMonthsAgo;
  });
  const coachingNextDate = recentCoaching
    ? new Date(new Date(recentCoaching.created_at).setMonth(new Date(recentCoaching.created_at).getMonth() + 3))
        .toLocaleDateString()
    : null;

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

  const handleManage = async () => {
    setLoading('premium');
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

  return (
    <div className="space-y-6">
      {/* Free tier */}
      <ServiceCard
        icon="🎯"
        title={t('services.levelCheck.title')}
        desc={t('services.levelCheck.desc')}
        price={t('services.levelCheck.price')}
      >
        <a
          href="/level-check"
          className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
        >
          {t('services.levelCheck.cta')}
        </a>
      </ServiceCard>

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
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-4 right-4">
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {t('services.premium.badge')}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">✨</span>
          <div>
            <h3 className="text-2xl font-bold">{t('services.premium.title')}</h3>
            <span className="text-orange-600 font-semibold">{t('services.premium.price')}</span>
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
              onClick={handleManage}
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
        ) : recentCoaching ? (
          <div>
            <span className="inline-block px-6 py-3 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed">
              {t('services.coaching.purchased')}
            </span>
            {coachingNextDate && (
              <p className="text-sm text-gray-500 mt-2">
                {t('services.coaching.nextAvailable').replace('{{date}}', coachingNextDate)}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleCheckout('coaching')}
            disabled={loading === 'coaching'}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading === 'coaching' ? t('services.loading') : t('services.coaching.cta')}
          </button>
        )}
      </ServiceCard>

      <ServiceCard
        icon="🚀"
        title={t('services.session.title')}
        desc={t('services.session.desc')}
        price={t('services.session.price')}
      >
        {!isLoggedIn ? (
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('services.login')}
          </a>
        ) : !hasCoaching ? (
          <span className="inline-block px-6 py-3 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed">
            {t('services.session.requiresCoaching')}
          </span>
        ) : (
          <button
            onClick={() => handleCheckout('session')}
            disabled={loading === 'session'}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading === 'session' ? t('services.loading') : t('services.session.cta')}
          </button>
        )}
      </ServiceCard>

      {/* High-tier inquiry services */}
      <ServiceCard
        icon="🎤"
        title={t('services.appearance.title')}
        desc={t('services.appearance.desc')}
        muted
      >
        <a
          href="/gowm"
          className="inline-block px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          {t('services.appearance.cta')}
        </a>
      </ServiceCard>

      <ServiceCard
        icon="🏫"
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
      className={`rounded-2xl p-8 shadow-sm ${
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
