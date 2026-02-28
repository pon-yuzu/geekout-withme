import { useState } from 'react';
import { useTranslation } from '../../i18n/index';

interface LikeButtonProps {
  targetType: 'thread' | 'reply';
  targetId: string;
  likeCount: number;
  userLiked: boolean;
}

export default function LikeButton({ targetType, targetId, likeCount: initialCount, userLiked: initialLiked }: LikeButtonProps) {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!liked);
    setCount(wasLiked ? count - 1 : count + 1);

    try {
      const res = await fetch('/api/board/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
      });

      if (!res.ok) {
        // Revert on error
        setLiked(wasLiked);
        setCount(wasLiked ? count : count - 1);
      }
    } catch {
      setLiked(wasLiked);
      setCount(wasLiked ? count : count - 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs transition-colors ${
        liked ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'
      }`}
    >
      {liked ? '❤️' : '🤍'} {count > 0 ? count : ''}
    </button>
  );
}
