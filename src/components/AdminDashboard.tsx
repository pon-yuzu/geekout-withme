import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/index';
import type { Lang } from '../i18n/index';

interface UserStats {
  total_users: number;
  new_this_month: number;
  english_learners: number;
  japanese_learners: number;
}

interface AssessmentStats {
  total_assessments: number;
  english_assessments: number;
  japanese_assessments: number;
  text_mode: number;
  voice_mode: number;
  both_mode: number;
}

interface SubscriptionStats {
  active_subscriptions: number;
  canceled_subscriptions: number;
}

interface WorkbookStats {
  total_workbooks: number;
  completed_workbooks: number;
  completion_rate: number;
}

interface DailySignup {
  date: string;
  signups: number;
}

interface StatsData {
  users: UserStats | null;
  assessments: AssessmentStats | null;
  subscriptions: SubscriptionStats | null;
  workbooks: WorkbookStats | null;
  dailySignups: DailySignup[];
}

export default function AdminDashboard({ lang }: { lang: Lang }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>{t('admin.error')}: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const maxSignups = Math.max(...(stats.dailySignups.map((d) => d.signups)), 1);

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="text-orange-500">{t('admin.title')}</span>
        </h1>
        <p className="text-gray-500">{t('admin.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Users */}
        <StatCard title={t('admin.users')}>
          <StatRow label={t('admin.total')} value={stats.users?.total_users ?? 0} />
          <StatRow label={t('admin.thisMonth')} value={stats.users?.new_this_month ?? 0} highlight />
          <div className="mt-3 pt-3 border-t border-orange-100">
            <StatRow label={t('admin.english')} value={stats.users?.english_learners ?? 0} />
            <StatRow label={t('admin.japanese')} value={stats.users?.japanese_learners ?? 0} />
          </div>
        </StatCard>

        {/* Assessments */}
        <StatCard title={t('admin.assessments')}>
          <StatRow label={t('admin.total')} value={stats.assessments?.total_assessments ?? 0} />
          <div className="mt-3 pt-3 border-t border-orange-100">
            <StatRow label={t('admin.english')} value={stats.assessments?.english_assessments ?? 0} />
            <StatRow label={t('admin.japanese')} value={stats.assessments?.japanese_assessments ?? 0} />
          </div>
          <div className="mt-3 pt-3 border-t border-orange-100">
            <StatRow label="Text" value={stats.assessments?.text_mode ?? 0} />
            <StatRow label="Voice" value={stats.assessments?.voice_mode ?? 0} />
            <StatRow label="Both" value={stats.assessments?.both_mode ?? 0} />
          </div>
        </StatCard>

        {/* Subscriptions */}
        <StatCard title={t('admin.subscriptions')}>
          <StatRow label={t('admin.active')} value={stats.subscriptions?.active_subscriptions ?? 0} highlight />
          <StatRow label={t('admin.canceled')} value={stats.subscriptions?.canceled_subscriptions ?? 0} />
        </StatCard>

        {/* Workbooks */}
        <StatCard title={t('admin.workbooks')}>
          <StatRow label={t('admin.total')} value={stats.workbooks?.total_workbooks ?? 0} />
          <StatRow label={t('admin.completed')} value={stats.workbooks?.completed_workbooks ?? 0} />
          <StatRow label={t('admin.completionRate')} value={`${stats.workbooks?.completion_rate ?? 0}%`} highlight />
        </StatCard>
      </div>

      {/* Daily Signups Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('admin.newSignups')}</h2>
        <div className="flex items-end gap-1 h-40">
          {stats.dailySignups.map((day) => {
            const height = day.signups > 0 ? Math.max((day.signups / maxSignups) * 100, 4) : 0;
            const dateStr = new Date(day.date).getDate().toString();
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="absolute -top-6 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {day.date}: {day.signups}
                </div>
                <div
                  className="w-full bg-orange-400 rounded-t hover:bg-orange-500 transition-colors"
                  style={{ height: `${height}%` }}
                />
                {(Number(dateStr) === 1 || Number(dateStr) % 5 === 0) && (
                  <span className="text-[10px] text-gray-400 mt-1">{dateStr}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloudflare Analytics Link */}
      <div className="text-center">
        <a
          href="https://dash.cloudflare.com/?to=/:account/web-analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {t('admin.cfAnalytics')}
        </a>
      </div>
    </div>
  );
}

function StatCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-orange-500 text-lg' : 'text-gray-800'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
