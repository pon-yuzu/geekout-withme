import type { Workbook } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';

const WORKBOOK_TTL_DAYS = 30;

interface Props {
  workbook: Workbook;
  showAuthor?: boolean;
  userCompletedDays?: number;
}

export function WorkbookCard({ workbook, showAuthor, userCompletedDays }: Props) {
  const { t, lang } = useTranslation();
  const isGenerating = workbook.status === 'generating';
  const isFailed = workbook.status === 'failed';
  const totalDays = workbook.is_public ? 30 : 7;

  const expiresAt = new Date(workbook.created_at);
  expiresAt.setDate(expiresAt.getDate() + WORKBOOK_TTL_DAYS);
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const progress = Math.round((workbook.days_completed / totalDays) * 100);
  const hasStudyProgress = typeof userCompletedDays === 'number' && userCompletedDays > 0;
  const studyProgress = hasStudyProgress ? Math.round((userCompletedDays / totalDays) * 100) : 0;

  return (
    <a
      href={isGenerating ? `/workbook/create` : `/workbook/${workbook.id}`}
      className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{workbook.title}</h3>
        {isGenerating && (
          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
            {t('workbook.card.generating')}
          </span>
        )}
        {isFailed && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {t('workbook.card.error')}
          </span>
        )}
        {workbook.status === 'completed' && (
          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
            {t('workbook.card.completed')}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {workbook.subtitle}
        {showAuthor && workbook.is_public && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-teal-50 text-teal-500 text-xs rounded-full">
            {t('workbook.card.public')}
          </span>
        )}
      </p>

      {/* Generation Progress (only show when generating) */}
      {isGenerating && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{workbook.days_completed} / {totalDays} {t('workbook.card.days')}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Study Progress (completed workbooks only) */}
      {!isGenerating && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{hasStudyProgress ? `${userCompletedDays} / ${totalDays}` : `0 / ${totalDays}`} {t('workbook.card.studied')}</span>
            <span>{studyProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-teal-400 h-2 rounded-full transition-all"
              style={{ width: `${studyProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs" suppressHydrationWarning>
        <span className="text-gray-400">
          {new Date(workbook.created_at).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}
        </span>
        <span className={isUrgent ? 'text-red-500 font-medium' : 'text-gray-400'}>
          {daysRemaining <= 0
            ? t('workbook.card.expired')
            : daysRemaining === 0
              ? t('workbook.card.expiresToday')
              : t('workbook.card.expiresIn').replace('{days}', String(daysRemaining))}
        </span>
      </div>
    </a>
  );
}
