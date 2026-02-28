import { useState } from 'react';
import { useTranslation } from '../../i18n/index';

interface ReplyFormProps {
  threadId: string;
  onReplyCreated: (reply: any) => void;
}

export default function ReplyForm({ threadId, onReplyCreated }: ReplyFormProps) {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch('/api/board/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, body: body.trim() }),
      });

      if (res.ok) {
        const reply = await res.json();
        onReplyCreated(reply);
        setBody('');
      }
    } catch {
      // silently fail
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('board.reply.placeholder')}
        maxLength={5000}
        rows={3}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none text-sm"
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={!body.trim() || posting}
          className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {posting ? t('board.reply.posting') : t('board.reply.submit')}
        </button>
      </div>
    </form>
  );
}
