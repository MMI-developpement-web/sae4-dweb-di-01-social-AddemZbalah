import { useState, useEffect } from 'react';
import { getPosts, getReplies } from '../../../lib/api';
import ContentCensor from './ContentCensor';

interface PostModerationProps {
  searchTerm?: string;
}

export default function PostModeration({ searchTerm = '' }: PostModerationProps) {
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const data = await getPosts(1);
        let allContent: any[] = [];

        // Add all posts
        const posts = (data.posts || []).map((p: any) => ({ ...p, type: 'post' }));
        allContent = [...posts];

        // Fetch and add all replies from all posts
        for (const post of posts) {
          const replies = await getReplies(post.id);
          const repliesWithType = (replies || []).map((r: any) => ({
            ...r,
            type: 'reply',
            parentPostId: post.id,
          }));
          allContent = [...allContent, ...repliesWithType];
        }

        // Filter by search term if provided
        if (searchTerm) {
          allContent = allContent.filter((c: any) =>
            (c.content || c.textContent)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            c.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setContent(allContent);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement du contenu');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [searchTerm]);

  if (isLoading) {
    return <div className="text-center py-8">Chargement du contenu...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Contenu à modérer</h2>

      {content.length === 0 ? (
        <aside className="text-center py-8 text-secondary/70">
          Aucun contenu trouvé
        </aside>
      ) : (
        <div className="space-y-3">
          {content.map((item) => (
            <article
              key={`${item.type}-${item.id}`}
              className={`rounded-lg p-4 border space-y-3 ${
                item.type === 'reply'
                  ? 'bg-primary/10 border-primary/30 ml-4'
                  : 'bg-primary/20 border-primary/40'
              }`}
            >
              {/* Content Info */}
              <header className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{item.author?.name}</p>
                    {item.type === 'reply' && (
                      <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                        Réponse
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary/70">@{item.author?.mail?.split('@')[0]}</p>
                  <p className="text-xs text-secondary/60 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ContentCensor
                  contentId={item.id}
                  type={item.type}
                  isCensored={item.isCensored || item.censored || false}
                  onCensorChange={() => {
                    setContent((prev) =>
                      prev.map((c) =>
                        c.id === item.id && c.type === item.type
                          ? {
                              ...c,
                              isCensored: !c.isCensored,
                              censored: !c.censored,
                            }
                          : c
                      )
                    );
                  }}
                />
              </header>

              {/* Content */}
              <section className="bg-black/30 rounded p-3">
                <p className="text-secondary text-sm overflow-wrap-break-word">
                  {item.type === 'post' ? item.content : item.textContent}
                </p>
                {item.mediaUrl && (
                  <figure className="mt-2">
                    {item.mediaUrl.match(/\.(mp4|webm|ogg)$/i) || item.mediaUrl.match(/^data:video\//i) ? (
                      <video
                        src={item.mediaUrl}
                        controls
                        className="w-full rounded max-h-64 object-cover"
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt="Media"
                        className="w-full rounded max-h-64 object-cover"
                      />
                    )}
                  </figure>
                )}
              </section>

              {/* Status Badge */}
              {(item.isCensored || item.censored) && (
                <aside className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2">
                  <p className="text-yellow-400 text-sm font-medium">
                    ⚠️ Ce contenu a été censuré
                  </p>
                </aside>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
