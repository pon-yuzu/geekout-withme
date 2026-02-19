import { useState, useEffect, useRef } from 'react';
import type { SlotValues, GenerationStatus } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';

interface Props {
  slots: SlotValues;
  resumeWorkbookId?: string;
  resumeDaysCompleted?: number;
}

export function GenerationProgress({ slots, resumeWorkbookId, resumeDaysCompleted }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<GenerationStatus | null>(
    resumeWorkbookId
      ? { status: 'generating', daysCompleted: resumeDaysCompleted ?? 0, total: 30, workbookId: resumeWorkbookId }
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      if (resumeWorkbookId) {
        pollingRef.current = setInterval(() => pollStatus(resumeWorkbookId), 3000);
      } else {
        startGeneration();
      }
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function startGeneration() {
    try {
      const res = await fetch('/api/workbook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? t('workbook.generation.startError'));
      }
      const data = (await res.json()) as GenerationStatus;
      setStatus(data);

      pollingRef.current = setInterval(() => pollStatus(data.workbookId), 3000);
    } catch (err: any) {
      setError(err?.message ?? t('workbook.generation.startError'));
    }
  }

  async function pollStatus(workbookId: string) {
    try {
      const res = await fetch(`/api/workbook/status/${workbookId}`);
      if (!res.ok) throw new Error('Status check failed');

      const data = (await res.json()) as GenerationStatus;
      setStatus(data);

      if (data.status === 'completed') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        window.location.href = `/workbook/${workbookId}`;
      } else if (data.status === 'failed') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setError(t('workbook.generation.genError'));
      }
    } catch {
      // Don't stop polling on transient errors
    }
  }

  const progress = status ? Math.round((status.daysCompleted / status.total) * 100) : 0;

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <div className="text-6xl mb-6 animate-bounce">📚</div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {t('workbook.generation.title')}
      </h2>

      <p className="text-gray-500 mb-8">
        {t('workbook.generation.desc')}<br />
        {t('workbook.generation.descSub')}
      </p>

      {/* Slot Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-1">
        <div className="text-sm">
          <span className="text-gray-500">{t('workbook.generation.theme')}</span>
          <span className="font-medium">{slots.topicLabel}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">{t('workbook.generation.level')}</span>
          <span className="font-medium">{slots.levelLabel}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">{t('workbook.generation.goal')}</span>
          <span className="font-medium">{slots.destLabel}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{t('workbook.generation.progress')}</span>
          <span>{status?.daysCompleted ?? 0} / 30 {t('workbook.generation.days')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="block mt-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            {t('workbook.generation.reload')}
          </button>
        </div>
      )}
    </div>
  );
}
