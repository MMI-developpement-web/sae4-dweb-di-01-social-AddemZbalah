import { useState, useEffect } from 'react';
import { getFollowingUsers, unfollowUser } from '../../../lib/api';
import { Link } from 'react-router-dom';

interface FollowingUser {
  id: number;
  name: string;
  mail: string;
}

interface FollowingUsersListProps {
  userId: number;
  refreshTrigger?: boolean;
}

export default function FollowingUsersList({ userId, refreshTrigger = false }: FollowingUsersListProps) {
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState<number | null>(null);

  const loadFollowingUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getFollowingUsers(userId);
      setFollowingUsers(users || []);
    } catch (error) {
      console.error('Failed to load following users:', error);
      setFollowingUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFollowingUsers();
  }, [userId]);

  useEffect(() => {
    if (refreshTrigger) {
      loadFollowingUsers();
    }
  }, [refreshTrigger]);

  const handleUnfollow = async (userId: number) => {
    setUnfollowingId(userId);
    try {
      const success = await unfollowUser(userId);
      if (success) {
        setFollowingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setUnfollowingId(null);
    }
  };

  if (isLoading && followingUsers.length === 0) {
    return (
      <section className="px-6 py-4 border-b border-primary/20">
        <h3 className="text-lg font-bold text-white mb-4">Utilisateurs suivis</h3>
        <p className="text-secondary/60 text-sm">Chargement...</p>
      </section>
    );
  }

  return (
    <section className="px-6 py-4 border-b border-primary/20">
      <h3 className="text-lg font-bold text-white mb-4">Utilisateurs suivis ({followingUsers.length})</h3>
      {followingUsers.length === 0 ? (
        <p className="text-secondary/60 text-sm">Vous ne suivez personne</p>
      ) : (
        <ul className="space-y-3">
          {followingUsers.map(user => (
            <li key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20 hover:bg-secondary/15 transition-colors list-none">
              <Link
                to={`/profil/${user.id}`}
                className="flex-1 hover:opacity-80 transition-opacity"
              >
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-secondary/60">{user.mail}</p>
              </Link>
              <button
                onClick={() => handleUnfollow(user.id)}
                disabled={unfollowingId === user.id}
                className="ml-4 px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {unfollowingId === user.id ? '...' : 'Ne plus suivre'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
