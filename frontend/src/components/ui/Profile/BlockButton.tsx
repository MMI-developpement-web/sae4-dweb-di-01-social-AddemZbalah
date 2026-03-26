import { useState } from 'react';
import { blockUser, unblockUser } from '../../../lib/api';

interface BlockButtonProps {
  userId: number;
  isBlocking: boolean;
  onBlockChange?: (isBlocking: boolean) => void;
  disabled?: boolean;
}

export default function BlockButton({ userId, isBlocking: initialBlocking, onBlockChange, disabled = false }: BlockButtonProps) {
  const [isBlocking, setIsBlocking] = useState(initialBlocking);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);

    if (isBlocking) {
      const success = await unblockUser(userId);
      if (success) {
        setIsBlocking(false);
        onBlockChange?.(false);
      }
    } else {
      const success = await blockUser(userId);
      if (success) {
        setIsBlocking(true);
        onBlockChange?.(true);
      }
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || disabled}
      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
        isBlocking
          ? 'bg-gray-500 text-white hover:bg-gray-600'
          : 'bg-red-500 text-white hover:bg-red-600'
      } disabled:opacity-50`}
    >
      {isLoading ? '...' : isBlocking ? 'Débloquer' : 'Bloquer'}
    </button>
  );
}
