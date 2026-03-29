/**
 * EXAMPLE: How to integrate new components in FilActu (Feed)
 * 
 * This shows how to add:
 * - SearchBarWithFilters (US 4.3)
 * - Retweet button and badge display
 * - Content parsing for hashtags/mentions (US 3.5)
 */

import { useState, useEffect } from "react";
import { getPosts, getCurrentUser } from "@/lib/api";
import { SearchBarWithFilters } from "@/components/ui/Searchbar/SearchBarWithFilters";
import { RetweetButton } from "@/components/ui/Posts/RetweetButton";
import { RetweetBadge, RetweetComment } from "@/components/ui/Posts/PostBadges";
import { parseContent, renderHighlightedContent } from "@/lib/contentParser";

interface Post {
  id: number;
  content: string;
  retweetOf?: number;
  isPinned?: boolean;
  author: {
    id: number;
    name: string;
    mail: string;
  };
}

export function FilActuExampleWithNewFeatures() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadPosts();
    loadCurrentUser();
  }, []);

  async function loadPosts() {
    const data = await getPosts(1);
    setPosts(data.posts || []);
  }

  async function loadCurrentUser() {
    const user = await getCurrentUser();
    setCurrentUser(user);
  }

  const displayPosts = isSearching ? searchResults : posts;
  const isUserRetweeted = (post: Post) => {
    // Check if current user has retweeted this post
    // This would need to be tracked in your app state or API
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar with Filters (US 4.3) */}
      <SearchBarWithFilters
        onResultsUpdate={(results) => {
          setSearchResults(results.posts || []);
          setIsSearching(results.posts?.length > 0);
        }}
        onSearch={(query) => {
          console.log("Searching for:", query);
        }}
      />

      {/* Posts List */}
      <div className="space-y-4">
        {displayPosts.map((post) => (
          <div key={post.id} className="bg-page-dark rounded-lg p-4 border border-secondary/20">
            {/* Display retweet badge if this is a retweet */}
            {post.retweetOf && (
              <>
                <RetweetBadge
                  retweeterName={post.author.name}
                  retweeterHandle={post.author.mail}
                  showComment={post.content.length > 0}
                />
                {post.content && (
                  <RetweetComment comment={post.content} />
                )}
              </>
            )}

            {/* Post Content */}
            <div className="mb-3">
              <h3 className="font-semibold text-secondary">{post.author.name}</h3>
              {/* US 3.5: Parse and highlight hashtags/mentions */}
              <p className="text-secondary/90 mt-2">
                {renderHighlightedContent(parseContent(post.content))}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-around text-secondary/60">
              <button>💬 Comment</button>
              
              {/* Retweet Button */}
              <RetweetButton
                postId={post.id}
                isRetweeted={isUserRetweeted(post)}
                isAuthor={currentUser?.id === post.author.id}
                onRetweetChange={(isRetweeted) => {
                  console.log("Retweet status changed:", isRetweeted);
                  // Optionally refresh posts
                }}
              />
              
              <button>❤️ Like</button>
              <button>↗️ Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MIGRATION CHECKLIST:
 * 
 * 1. Import the SearchBarWithFilters component at the top of your FilActu page
 * 2. Add it above your posts list
 * 3. For each post, check if post.retweetOf exists:
 *    - If yes, display RetweetBadge and RetweetComment
 * 4. For post content, use parseContent() and renderHighlightedContent()
 * 5. Add RetweetButton to your action buttons section
 * 6. Track which posts the user has retweeted (add to your component state)
 */
