import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';
import PostCard from './PostCard';
import ReplyForm from './ReplyForm';
import LikeButton from './LikeButton';
import TranslationToggle from './TranslationToggle';

interface ThreadDetailProps {
  threadId: string;
}

function timeAgo(dateStr: string, t: (key: string, params?: Record<string, string>) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('board.timeAgo.now');
  if (diffMin < 60) return t('board.timeAgo.minutes', { count: String(diffMin) });
  if (diffHr < 24) return t('board.timeAgo.hours', { count: String(diffHr) });
  return t('board.timeAgo.days', { count: String(diffDay) });
}

export default function ThreadDetail({ threadId }: ThreadDetailProps) {
  const { t } = useTranslation();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/board/threads/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          setThread(data.thread);
          setReplies(data.replies);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [threadId]);

  const handleReplyCreated = (reply: any) => {
    setReplies((prev) => [...prev, reply]);
    if (thread) {
      setThread({ ...thread, reply_count: thread.reply_count + 1 });
    }
  };

  if (loading) {
    return <p className="text-center text-gray-400 py-8">{t('board.loading')}</p>;
  }

  if (!thread) {
    return <p className="text-center text-gray-400 py-8">Thread not found</p>;
  }

  const author = thread.author;
  const initial = (author?.display_name || '?').charAt(0).toUpperCase();

  return (
    <div>
      {/* Thread */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              {initial}
            </div>
          )}
          <div>
            <span className="font-medium text-gray-800">{author?.display_name || 'Anonymous'}</span>
            <span className="text-xs text-gray-400 ml-2">{timeAgo(thread.created_at, t)}</span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-3">{thread.title}</h1>
        <p className="text-gray-600 whitespace-pre-wrap break-words mb-4">{thread.body}</p>

        <div className="flex items-center gap-4">
          <LikeButton targetType="thread" targetId={thread.id} likeCount={thread.like_count} userLiked={thread.user_liked} />
          <span className="text-xs text-gray-400">
            💬 {t('board.thread.replies', { count: String(thread.reply_count) })}
          </span>
          <TranslationToggle sourceType="thread_body" sourceId={thread.id} text={`${thread.title}\n\n${thread.body}`} />
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        {replies.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">{t('board.thread.noReplies')}</p>
        ) : (
          replies.map((reply) => (
            <PostCard
              key={reply.id}
              id={reply.id}
              body={reply.body}
              author={reply.author}
              likeCount={reply.like_count}
              userLiked={reply.user_liked}
              createdAt={reply.created_at}
              targetType="reply"
            />
          ))
        )}
      </div>

      {/* Reply form */}
      <ReplyForm threadId={threadId} onReplyCreated={handleReplyCreated} />
    </div>
  );
}
