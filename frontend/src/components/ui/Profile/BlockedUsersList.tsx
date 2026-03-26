import { useState, useEffect } from 'react';
import { getBlockedUsers, unblockUser } from '../../../lib/api';

interface BlockedUser {
  id: number;
  name: string;
  mail: string;
}

interface BlockedUsersListProps {
  refreshTrigger?: boolean;
}

export default function BlockedUsersList({ refreshTrigger = false }: BlockedUsersListProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        setIsLoading(true);
        const users = await getBlockedUsers();
        setBlockedUsers(users || []);
      } catch (error) {
        console.error('Failed to load blocked users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlockedUsers();
  }, [refreshTrigger]);

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId);
    try {
      const success = await unblockUser(userId);
      if (success) {
        setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to unblock user:', error);
    } finally {
      setUnblockingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="px-6 py-4 border-b border-primary/20">
        <h3 className="text-lg font-bold text-white mb-4">Utilisateurs bloqués</h3>
        <p className="text-secondary/60 text-sm">Chargement...</p>
      </section>
    );
  }

  if (blockedUsers.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-4 border-b border-primary/20">
      <h3 className="text-lg font-bold text-white mb-4">Utilisateurs bloqués ({blockedUsers.length})</h3>
      <div className="space-y-3">
        {blockedUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="flex-1">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-secondary/60">{user.mail}</p>
            </div>
            <button
              onClick={() => handleUnblock(user.id)}
              disabled={unblockingId === user.id}
              className="ml-4 px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {unblockingId === user.id ? '...' : 'Débloquer'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
