import { useState } from 'react';
import { censorPost, uncensorPost } from '../../../lib/api';

interface PostCensorProps {
  postId: number;
  isCensored: boolean;
  onCensorChange?: (isCensored: boolean) => void;
}

export default function PostCensor({ postId, isCensored: initialCensored, onCensorChange }: PostCensorProps) {
  const [isCensored, setIsCensored] = useState(initialCensored);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    if (isCensored) {
      const success = await uncensorPost(postId);
      if (success) {
        setIsCensored(false);
        onCensorChange?.(false);
      }
    } else {
      const success = await censorPost(postId);
      if (success) {
        setIsCensored(true);
        onCensorChange?.(true);
      }
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
        isCensored
          ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
          : 'bg-red-200 text-red-800 hover:bg-red-300'
      } disabled:opacity-50`}
      title={isCensored ? 'Décensurer' : 'Censurer'}
    >
      {isLoading ? '...' : isCensored ? '⚠️ Censuré' : '📢 Censurer'}
    </button>
  );
}
