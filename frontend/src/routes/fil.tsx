import Post from "../components/FilActu/post";

interface FeedPostData {
  id: number;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  commentCount: number;
  shareCount: number;
  likeCount: number;
  image?: string;
}

interface FilProps {
  className?: string;
}

const FEED_POSTS: FeedPostData[] = [
  {
    id: 1,
    authorName: "James Harden",
    authorHandle: "jamesharden01",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: "il y a 1 jour",
    content: "Magnifique journée aujourd'hui pour coder en plein air",
    commentCount: 40,
    shareCount: 932,
    likeCount: 121,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    authorName: "Alex Chen",
    authorHandle: "alexc_dev",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    timestamp: "il y a environ 17 heures",
    content:
      "Je viens de tester le nouveau framework React ! C'est vraiment incroyable à quel point ça simplifie le développement front-end. Qu'en pensez-vous ?",
    commentCount: 32,
    shareCount: 957,
    likeCount: 1794,
  },
  {
    id: 3,
    authorName: "Marie Dubois",
    authorHandle: "marie_dldsq",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    timestamp: "il y a 2 jours",
    content: "Magnifique journée aujourd'hui pour coder en plein air ⭐",
    commentCount: 14,
    shareCount: 235,
    likeCount: 617,
  },
  {
    id: 4,
    authorName: "James Harden",
    authorHandle: "jamesharden01",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: "il y a environ 10 heures",
    content: "Magnifique journée aujourd'hui pour coder en plein air ⭐",
    commentCount: 43,
    shareCount: 711,
    likeCount: 2671,
  },
  {
    id: 5,
    authorName: "James Harden",
    authorHandle: "jamesharden01",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: "il y a 2 jours",
    content:
      "Je viens de tester le nouveau framework React ! C'est vraiment incroyable à quel point ça simplifie le développement front-end. Qu'en pensez-vous ?",
    commentCount: 23,
    shareCount: 615,
    likeCount: 4930,
  },
  {
    id: 6,
    authorName: "Alex Chen",
    authorHandle: "alexc_dev",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    timestamp: "il y a 1 jour",
    content:
      "Un petit rappel de l'importance du design system : il permet une cohérence visuelle et fonctionnelle à travers toutes les interfaces.",
    commentCount: 18,
    shareCount: 402,
    likeCount: 856,
  },
];

export default function Fil({ className }: FilProps) {
  const handlePostAction = (postId: number, action: string) => {
    console.log(`Action '${action}' sur le post ${postId}`);
  };

  return (
    <main
      className={className || "flex flex-col h-screen bg-page-dark"}
      role="feed"
      aria-label="Fil d'actualité"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-primary/30 bg-page-dark/98 backdrop-blur-sm px-4 py-4">
        <h1 className="text-base font-semibold text-secondary">Mon Fil</h1>
      </header>

      {/* Posts list - scrollable */}
      <ul className="flex flex-1 flex-col gap-0 overflow-y-auto" role="list">
        {FEED_POSTS.map((post) => (
          <li key={post.id} className="list-none border-b border-primary/20">
            <Post
              authorName={post.authorName}
              authorHandle={post.authorHandle}
              authorAvatar={post.authorAvatar}
              timestamp={post.timestamp}
              content={post.content}
              commentCount={post.commentCount}
              shareCount={post.shareCount}
              likeCount={post.likeCount}
              onComment={() => handlePostAction(post.id, "comment")}
              onShare={() => handlePostAction(post.id, "share")}
              onLike={() => handlePostAction(post.id, "like")}
              onMoreActions={() => handlePostAction(post.id, "more")}
            />
          </li>
        ))}
      </ul>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-page-dark/95 px-4 py-6 text-center">
        <p className="text-xs text-secondary/50">
          Fin du fil
        </p>
      </footer>
    </main>
  );
}
