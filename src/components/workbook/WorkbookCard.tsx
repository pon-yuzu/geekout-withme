import type { Workbook } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';

interface Props {
  workbook: Workbook;
  showAuthor?: boolean;
}

export function WorkbookCard({ workbook, showAuthor }: Props) {
  const { t, lang } = useTranslation();
  const isGenerating = workbook.status === 'generating';
  const isFailed = workbook.status === 'failed';
  const progress = Math.round((workbook.days_completed / 30) * 100);

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

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{workbook.days_completed} / 30 {t('workbook.card.days')}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-400" suppressHydrationWarning>
        {new Date(workbook.created_at).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}
      </div>
    </a>
  );
}
