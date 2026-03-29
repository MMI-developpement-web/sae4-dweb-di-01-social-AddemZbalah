/**
 * EXAMPLE: How to integrate new components in Profile page
 * 
 * This shows how to add:
 * - SettingsPanel (US 2.3)
 * - PinButton for posts
 * - Display pinned post at top
 * - Content parsing for hashtags/mentions (US 3.5)
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPosts, getUserById, getCurrentUser } from "@/lib/api";
import { SettingsPanel } from "@/components/ui/Profile/SettingsPanel";
import { PinButton } from "@/components/ui/Posts/PinButton";
import { PinnedPostBadge } from "@/components/ui/Posts/PostBadges";
import { RetweetButton } from "@/components/ui/Posts/RetweetButton";
import { parseContent, renderHighlightedContent } from "@/lib/contentParser";

interface Post {
  id: number;
  content: string;
  isPinned?: boolean;
  retweetOf?: number;
  author: {
    id: number;
    name: string;
    mail: string;
  };
}

export function ProfileExampleWithNewFeatures() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      loadCurrentUser();
    }
  }, [userId]);

  async function loadProfile() {
    const user = await getUserById(parseInt(userId!));
    setProfile(user);
  }

  async function loadPosts() {
    const data = await getPosts(1, parseInt(userId!));
    setPosts(data.posts || []);
  }

  async function loadCurrentUser() {
    const user = await getCurrentUser();
    setCurrentUser(user);
    setIsOwnProfile(user?.id === parseInt(userId!));
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  const handlePinChange = (postId: number, isPinned: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, isPinned } : p
      )
    );
  };

  if (!profile) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-page-dark rounded-lg p-6">
        <h1 className="text-2xl font-bold text-secondary">{profile.name}</h1>
        <p className="text-secondary/70">@{profile.mail}</p>
        <p className="text-secondary/90 mt-2">{profile.bio}</p>
      </div>

      {/* Settings Panel (US 2.3) - Only show if own profile */}
      {isOwnProfile && (
        <section>
          <h2 className="text-lg font-semibold text-secondary mb-4">Paramètres</h2>
          <SettingsPanel />
        </section>
      )}

      {/* Posts Section */}
      <section>
        <h2 className="text-lg font-semibold text-secondary mb-4">Posts</h2>
        <div className="space-y-4">
          {/* Pinned Posts (US 3.6) */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-2">
              {pinnedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-primary/10 border border-primary/30 rounded-lg p-4"
                >
                  <PinnedPostBadge />

                  {/* Post Content */}
                  <p className="text-secondary/90 my-3">
                    {renderHighlightedContent(parseContent(post.content))}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-start mt-3">
                    {isOwnProfile && (
                      <PinButton
                        postId={post.id}
                        isPinned={true}
                        isAuthor={true}
                        onPinChange={(isPinned) =>
                          handlePinChange(post.id, isPinned)
                        }
                      />
                    )}
                    {currentUser?.id !== post.author.id && (
                      <RetweetButton
                        postId={post.id}
                        isRetweeted={false}
                        isAuthor={false}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.map((post) => (
            <div
              key={post.id}
              className="bg-page-dark border border-secondary/20 rounded-lg p-4"
            >
              {/* Post Content */}
              <p className="text-secondary/90">
                {renderHighlightedContent(parseContent(post.content))}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-start mt-3 text-secondary/60">
                {isOwnProfile && (
                  <PinButton
                    postId={post.id}
                    isPinned={false}
                    isAuthor={true}
                    onPinChange={(isPinned) =>
                      handlePinChange(post.id, isPinned)
                    }
                  />
                )}

                {currentUser?.id !== post.author.id && (
                  <RetweetButton
                    postId={post.id}
                    isRetweeted={false}
                    isAuthor={false}
                    onRetweetChange={() => {
                      // Optionally refresh or show notification
                      console.log("Retweeted!");
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * MIGRATION CHECKLIST:
 * 
 * 1. Import SettingsPanel and show it only for the user's own profile
 * 2. Separate posts into pinnedPosts and regularPosts
 * 3. Display pinned posts first with PinnedPostBadge
 * 4. For each post:
 *    - Use parseContent() and renderHighlightedContent() for content (US 3.5)
 *    - Show PinButton if user is the author
 *    - Show RetweetButton if user is not the author
 * 5. Use isPinned field to determine styling (highlight pinned posts)
 * 6. Handle pin state changes with handlePinChange callback
 */
