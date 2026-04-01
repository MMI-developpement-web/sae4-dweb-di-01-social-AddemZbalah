import { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { censorPost, uncensorPost, censorReply, uncensorReply } from '../../../lib/api';

const censorButtonVariants = cva(
  'px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50',
  {
    variants: {
      status: {
        censored: 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300',
        active: 'bg-red-200 text-red-800 hover:bg-red-300',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  },
);

interface ContentCensorProps extends VariantProps<typeof censorButtonVariants> {
  contentId: number;
  type: 'post' | 'reply';
  isCensored: boolean;
  onCensorChange?: (isCensored: boolean) => void;
}

export default function ContentCensor({
  contentId,
  type,
  isCensored: initialCensored,
  onCensorChange,
}: ContentCensorProps) {
  const [isCensored, setIsCensored] = useState(initialCensored);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    let success = false;
    if (isCensored) {
      success = type === 'post' ? await uncensorPost(contentId) : await uncensorReply(contentId);
      if (success) {
        setIsCensored(false);
        onCensorChange?.(false);
      }
    } else {
      success = type === 'post' ? await censorPost(contentId) : await censorReply(contentId);
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
      className={cn(censorButtonVariants({ status: isCensored ? 'censored' : 'active' }))}
      title={isCensored ? 'Décensurer' : 'Censurer'}
    >
      {isCensored ? '✓ Censuré' : '🚫 Actif'}
    </button>
  );
}
