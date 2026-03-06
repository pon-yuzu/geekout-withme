import { useEffect, useState, useCallback } from 'react';
import type { StudentConfigRow, AdaptiveWorkbookDay, AdaptiveDayContent } from '../../lib/adaptive-workbook/types';

interface Props {
  config: StudentConfigRow;
  onBack: () => void;
}

export default function WorkbookReview({ config, onBack }: Props) {
  const [days, setDays] = useState<AdaptiveWorkbookDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<AdaptiveWorkbookDay | null>(null);
  const [generating, setGenerating] = useState(config.status === 'generating');
  const [progress, setProgress] = useState({ completed: config.days_completed, total: config.total_days });
  const [deploying, setDeploying] = useState(false);
  const [deploySlug, setDeploySlug] = useState('');
  const [deployTitle, setDeployTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [regeneratingDayId, setRegeneratingDayId] = useState<string | null>(null);

  const fetchDays = useCallback(async () => {
    const res = await fetch(`/api/admin/wb-days?configId=${config.id}`);
    if (res.ok) {
      const data = await res.json();
      setDays(data.days || []);
    }
  }, [config.id]);

  const isCronMode = config.generation_mode === 'weekly' || config.generation_mode === 'daily';

  // Poll for generation progress (batch mode only)
  useEffect(() => {
    if (!generating || isCronMode) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/wb-generate-status?configId=${config.id}`);
        const data = await res.json();
        setProgress({ completed: data.days_completed, total: data.total_days });

        if (data.status === 'review') {
          setGenerating(false);
          fetchDays();
        } else {
          fetchDays();
        }
      } catch {
        // Continue polling
      }
    };

    const interval = setInterval(poll, 5000);
    poll();
    return () => clearInterval(interval);
  }, [generating, isCronMode, config.id, fetchDays]);

  // Initial fetch (always load existing days)
  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  const handleReview = async (dayId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch('/api/admin/wb-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_id: dayId, review_status: status, review_notes: notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setDays((prev) => prev.map((d) => d.id === dayId ? data.day : d));
        if (selectedDay?.id === dayId) setSelectedDay(data.day);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegenerate = async (dayId: string) => {
    setRegeneratingDayId(dayId);
    try {
      const res = await fetch('/api/admin/wb-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_id: dayId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDays((prev) => prev.map((d) => d.id === dayId ? data.day : d));
        if (selectedDay?.id === dayId) setSelectedDay(data.day);
      } else {
        const data = await res.json();
        setError(data.error || 'Regeneration failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegeneratingDayId(null);
    }
  };

  const handleApproveAll = async () => {
    for (const day of days) {
      if (day.review_status !== 'approved') {
        await handleReview(day.id, 'approved');
      }
    }
  };

  const handleDeploy = async () => {
    if (!deploySlug || !deployTitle) {
      setError('Please enter slug and title for deployment');
      return;
    }

    setDeploying(true);
    setError(null);

    try {
      const navName = config.config_json?.navigator?.name || null;
      const res = await fetch('/api/admin/wb-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_id: config.id,
          slug: deploySlug,
          title: deployTitle,
          navigator_name: navName,
          theme_color: '#f97316',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deploy failed');
      }

      alert(`Deployed! URL: ${data.url}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  const approvedCount = days.filter((d) => d.review_status === 'approved').length;
  const allApproved = days.length >= progress.total && approvedCount === days.length;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Review: {config.display_name || config.config_json?.student?.display_name || 'Unknown'}
        </h2>
        <div className="text-sm text-gray-500">
          {approvedCount}/{days.length} approved
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Generation Progress */}
      {generating && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {!isCronMode && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />}
            <span className="font-medium text-yellow-800">
              {isCronMode
                ? `${config.generation_mode === 'weekly' ? 'Weekly' : 'Daily'} mode — ${progress.completed}/${progress.total} days generated`
                : `Generating Day ${progress.completed}/${progress.total}...`}
            </span>
          </div>
          <div className="bg-yellow-100 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          {isCronMode && (
            <p className="text-xs text-yellow-700 mt-2">
              {config.generation_mode === 'weekly'
                ? 'Cron generates 7 days per run. Refresh to see latest progress.'
                : 'Cron generates 1 day per run. Refresh to see latest progress.'}
            </p>
          )}
        </div>
      )}

      {/* Day Timeline Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
        {Array.from({ length: progress.total }, (_, i) => {
          const day = days.find((d) => d.day_number === i + 1);
          const isSelected = selectedDay?.day_number === i + 1;
          const statusColor = !day
            ? 'bg-gray-100 text-gray-400'
            : day.review_status === 'approved'
            ? 'bg-green-100 text-green-700 border-green-300'
            : day.review_status === 'rejected'
            ? 'bg-red-100 text-red-700 border-red-300'
            : 'bg-orange-50 text-orange-700 border-orange-200';

          return (
            <button
              key={i}
              onClick={() => day && setSelectedDay(day)}
              disabled={!day}
              className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-medium transition-all
                ${statusColor}
                ${isSelected ? 'ring-2 ring-orange-500 ring-offset-1' : ''}
                ${day ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Bulk actions */}
      {!generating && days.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleApproveAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
          >
            Approve All
          </button>
        </div>
      )}

      {/* Selected Day Preview */}
      {selectedDay && selectedDay.content_json && (
        <DayPreview
          day={selectedDay}
          onApprove={() => handleReview(selectedDay.id, 'approved')}
          onReject={() => handleReview(selectedDay.id, 'rejected')}
          onRegenerate={() => handleRegenerate(selectedDay.id)}
          regenerating={regeneratingDayId === selectedDay.id}
        />
      )}

      {/* Deploy Section */}
      {!generating && allApproved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6">
          <h3 className="font-semibold text-green-800 mb-3">Ready to Deploy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">URL Slug</label>
              <input
                value={deploySlug}
                onChange={(e) => setDeploySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., yuka-march-2026"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Workbook Title</label>
              <input
                value={deployTitle}
                onChange={(e) => setDeployTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g., Yuka's March 2026 Workbook"
              />
            </div>
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying || !deploySlug || !deployTitle}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            {deploying ? 'Deploying...' : 'Deploy to Student'}
          </button>
        </div>
      )}
    </div>
  );
}

function DayPreview({
  day, onApprove, onReject, onRegenerate, regenerating,
}: {
  day: AdaptiveWorkbookDay;
  onApprove: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const content = day.content_json as AdaptiveDayContent;
  if (!content) return null;

  const statusBadge =
    day.review_status === 'approved'
      ? 'bg-green-100 text-green-700'
      : day.review_status === 'rejected'
      ? 'bg-red-100 text-red-700'
      : 'bg-orange-100 text-orange-700';

  return (
    <div className="bg-white rounded-xl border border-orange-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Day {day.day_number}: {content.main.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
          {day.review_status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onApprove} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Approve</button>
        <button onClick={onReject} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">Reject</button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-4 text-sm">
        <ContentSection title="Main Content" color="orange">
          <p className="text-gray-600 italic mb-2">{content.main.intro}</p>
          <p className="text-gray-700 mb-2">{content.main.body}</p>
          {content.main.details.length > 0 && (
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              {content.main.details.map((d, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: d.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </ol>
          )}
        </ContentSection>

        <ContentSection title={`Main Vocab (${content.main_vocab.length})`} color="blue">
          <div className="flex flex-wrap gap-2">
            {content.main_vocab.map((v, i) => (
              <span key={i} className="bg-blue-50 px-2 py-1 rounded text-xs">
                <strong>{v.word}</strong> — {v.meaning}
              </span>
            ))}
          </div>
        </ContentSection>

        <ContentSection title="Quiz 1" color="purple">
          <QuizPreview quiz={content.quiz1} />
        </ContentSection>

        <ContentSection title="Review" color="green">
          <p className="text-gray-600 mb-1">
            <strong>{content.review.place}</strong> ({content.review.location}) {'★'.repeat(content.review.stars)}
          </p>
          <p className="text-gray-700">{content.review.content}</p>
        </ContentSection>

        <ContentSection title={`Review Vocab (${content.review_vocab.length})`} color="blue">
          <div className="flex flex-wrap gap-2">
            {content.review_vocab.map((v, i) => (
              <span key={i} className="bg-blue-50 px-2 py-1 rounded text-xs">
                <strong>{v.word}</strong> — {v.meaning}
              </span>
            ))}
          </div>
        </ContentSection>

        <ContentSection title="Quiz 2" color="purple">
          <QuizPreview quiz={content.quiz2} />
        </ContentSection>

        <ContentSection title="Tips" color="teal">
          <p className="font-medium text-gray-700 mb-1">{content.tips.title}</p>
          {content.tips.content.split('\n\n').filter(Boolean).map((p, i) => (
            <p key={i} className="text-gray-600 mb-2">{p}</p>
          ))}
        </ContentSection>

        <ContentSection title="Conversation" color="indigo">
          <p className="text-gray-500 italic mb-2">{content.conversation.scene}</p>
          <div className="space-y-1">
            {content.conversation.lines.map((line, i) => (
              <p key={i} className={line.speaker === 'A' ? 'text-indigo-700' : 'text-gray-700'}>
                <strong>{line.speaker}:</strong> {line.text}
              </p>
            ))}
          </div>
        </ContentSection>

        <ContentSection title={`Conversation Vocab (${content.conversation_vocab.length})`} color="blue">
          <div className="flex flex-wrap gap-2">
            {content.conversation_vocab.map((v, i) => (
              <span key={i} className="bg-blue-50 px-2 py-1 rounded text-xs">
                <strong>{v.word}</strong> — {v.meaning}
              </span>
            ))}
          </div>
        </ContentSection>

        <ContentSection title="Quiz 3" color="purple">
          <QuizPreview quiz={content.quiz3} />
        </ContentSection>

        <ContentSection title="Try It!" color="orange">
          <p className="text-gray-700">{content.try_it_hint}</p>
        </ContentSection>
      </div>
    </div>
  );
}

function ContentSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`border-l-4 border-${color}-300 pl-4 py-2`}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h4>
      {children}
    </div>
  );
}

function QuizPreview({ quiz }: { quiz: { question: string; options: string[]; correct: number } }) {
  return (
    <div>
      <p className="text-gray-700 font-medium mb-1">{quiz.question}</p>
      <div className="space-y-1">
        {quiz.options.map((opt, i) => (
          <p key={i} className={i === quiz.correct ? 'text-green-700 font-medium' : 'text-gray-500'}>
            {i === quiz.correct ? '✓' : '○'} {opt}
          </p>
        ))}
      </div>
    </div>
  );
}
