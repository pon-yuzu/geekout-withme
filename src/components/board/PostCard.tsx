import { useState } from 'react';
import { useTranslation } from '../../i18n/index';
import LikeButton from './LikeButton';
import TranslationToggle from './TranslationToggle';

interface Author {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface PostCardProps {
  id: string;
  body: string;
  title?: string;
  author: Author;
  likeCount: number;
  userLiked: boolean;
  createdAt: string;
  targetType: 'thread' | 'reply';
  onClick?: () => void;
  replyCount?: number;
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

export default function PostCard({
  id, body, title, author, likeCount, userLiked, createdAt, targetType, onClick, replyCount,
}: PostCardProps) {
  const { t } = useTranslation();
  const initial = (author.display_name || '?').charAt(0).toUpperCase();
  const displayName = author.display_name || 'Anonymous';

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 ${onClick ? 'cursor-pointer hover:border-orange-200 transition-colors' : ''}`} onClick={onClick}>
      {/* Author header */}
      <div className="flex items-center gap-3 mb-3">
        {author.avatar_url ? (
          <img src={author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-sm font-medium text-gray-800 truncate block">{displayName}</span>
          <span className="text-xs text-gray-400">{timeAgo(createdAt, t)}</span>
        </div>
      </div>

      {/* Title */}
      {title && (
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{title}</h3>
      )}

      {/* Body */}
      <p className="text-gray-600 text-sm whitespace-pre-wrap break-words mb-3 line-clamp-4">{body}</p>

      {/* Actions */}
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <LikeButton targetType={targetType} targetId={id} likeCount={likeCount} userLiked={userLiked} />
        {typeof replyCount === 'number' && (
          <span className="text-xs text-gray-400">
            💬 {replyCount}
          </span>
        )}
        <TranslationToggle
          sourceType={targetType === 'thread' ? (title ? 'thread_body' : 'thread_body') : 'reply'}
          sourceId={id}
          text={title ? `${title}\n\n${body}` : body}
        />
      </div>
    </div>
  );
}
