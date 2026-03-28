import { useState, useEffect } from 'react';
import { getPosts } from '../../../lib/api';
import PostCensor from './PostCensor';

interface PostModerationProps {
  searchTerm?: string;
}

export default function PostModeration({ searchTerm = '' }: PostModerationProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getPosts(1);
        let allPosts = data.posts || [];

        // Filter by search term if provided
        if (searchTerm) {
          allPosts = allPosts.filter((post: any) =>
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setPosts(allPosts);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des posts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  if (isLoading) {
    return <div className="text-center py-8">Chargement des posts...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Contenu à modérer</h2>

      {posts.length === 0 ? (
        <div className="text-center py-8 text-secondary/70">
          Aucun post trouvé
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-primary/20 rounded-lg p-4 border border-primary/40 space-y-3"
            >
              {/* Post Info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{post.author?.name}</p>
                  <p className="text-sm text-secondary/70">@{post.author?.mail?.split('@')[0]}</p>
                  <p className="text-xs text-secondary/60 mt-1">
                    {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <PostCensor
                  postId={post.id}
                  isCensored={post.censored || false}
                  onCensorChange={() => {
                    // Refresh post status
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === post.id ? { ...p, censored: !p.censored } : p
                      )
                    );
                  }}
                />
              </div>

              {/* Post Content */}
              <div className="bg-black/30 rounded p-3">
                <p className="text-secondary text-sm overflow-wrap-break-word">{post.content}</p>
                {post.mediaUrl && (
                  <div className="mt-2">
                    {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) || post.mediaUrl.match(/^data:video\//i) ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full rounded max-h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full rounded max-h-64 object-cover"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              {post.censored && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2">
                  <p className="text-yellow-400 text-sm font-medium">
                    ⚠️ Ce contenu a été censuré
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
