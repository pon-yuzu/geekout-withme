import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';
import PostCard from './PostCard';

interface ThreadListProps {
  boardId: string;
  boardSlug: string;
  postPermission: string;
  isAdmin: boolean;
}

export default function ThreadList({ boardId, boardSlug, postPermission, isAdmin }: ThreadListProps) {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const canCreate = postPermission === 'all' || isAdmin;

  const fetchThreads = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/board/threads?board_id=${boardId}&page=${pageNum}`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setThreads(data.threads);
        } else {
          setThreads((prev) => [...prev, ...data.threads]);
        }
        setHasMore(data.threads.length >= data.perPage);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads(1);
  }, [boardId]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchThreads(next);
  };

  return (
    <div>
      {/* Header with create button */}
      <div className="flex items-center justify-between mb-6">
        <a href="/board" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
          {t('board.thread.back')}
        </a>
        {canCreate ? (
          <a
            href={`/board/${boardSlug}/new`}
            className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            {t('board.thread.new')}
          </a>
        ) : (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {t('board.thread.cannotCreate')}
          </span>
        )}
      </div>

      {/* Thread list */}
      {loading && threads.length === 0 ? (
        <p className="text-center text-gray-400 py-8">{t('board.loading')}</p>
      ) : threads.length === 0 ? (
        <p className="text-center text-gray-400 py-8">{t('board.empty')}</p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <PostCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              body={thread.body}
              author={thread.author}
              likeCount={thread.like_count}
              userLiked={thread.user_liked}
              createdAt={thread.created_at}
              targetType="thread"
              replyCount={thread.reply_count}
              onClick={() => { window.location.href = `/board/thread/${thread.id}`; }}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && threads.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
          >
            {loading ? t('board.loading') : t('board.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
