import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { API_BASE, getAuthHeaders } from '../../../lib/api';

interface LikeButtonProps {
  postId: number;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md';
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function LikeButton({
  postId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer l'état initial du like
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
          setCount(data.likes_count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du statut du like:', error);
      }
    };

    fetchLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setCount(data.likes_count);
      } else {
        console.error('Erreur lors de la mise à jour du like');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSizeClasses = size === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm';
  const iconSizeClasses = 'h-4 w-4';

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-0 py-0 text-secondary/60 transition-all duration-200 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-page-dark disabled:opacity-50 disabled:cursor-not-allowed",
        buttonSizeClasses,
        liked && 'text-red-500 hover:text-red-600'
      )}
      aria-label={liked ? `${count} likes (dislike)` : `${count} likes`}
    >
      <motion.div
        className={cn("flex items-center justify-center", iconSizeClasses)}
        animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HeartIcon filled={liked} />
      </motion.div>
      <motion.span
        className="font-medium"
        key={count}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {count}
      </motion.span>
    </motion.button>
  );
}
