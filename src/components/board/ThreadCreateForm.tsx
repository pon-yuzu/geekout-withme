import { useState } from 'react';
import { useTranslation } from '../../i18n/index';

interface ThreadCreateFormProps {
  boardId: string;
  boardSlug: string;
  initialTitle?: string;
  initialBody?: string;
}

export default function ThreadCreateForm({ boardId, boardSlug, initialTitle, initialBody }: ThreadCreateFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle || '');
  const [body, setBody] = useState(initialBody || '');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || posting) return;

    setPosting(true);
    setError('');

    try {
      const res = await fetch('/api/board/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_id: boardId, title: title.trim(), body: body.trim() }),
      });

      if (res.ok) {
        window.location.href = `/board/${boardSlug}`;
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create thread');
      }
    } catch {
      setError('Network error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('board.thread.title')}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('board.thread.titlePlaceholder')}
          maxLength={100}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('board.thread.body')}</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('board.thread.bodyPlaceholder')}
          maxLength={5000}
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none text-sm"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/5000</p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <a
          href={`/board/${boardSlug}`}
          className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          {t('board.thread.back')}
        </a>
        <button
          type="submit"
          disabled={!title.trim() || !body.trim() || posting}
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {posting ? t('board.thread.posting') : t('board.thread.submit')}
        </button>
      </div>
    </form>
  );
}
