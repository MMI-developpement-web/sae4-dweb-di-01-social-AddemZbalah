import { useEffect, useId, useState } from "react";
import Post from "../ui/FilActu/post";
import Nav from "../ui/Navbar/nav";

const FEED_POSTS = [
  {
    id: 1,
    authorName: "James Harden",
    authorHandle: "jamesharden01",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    timestamp: "il y a 1 jour",
    content: "Magnifique journee aujourd'hui pour coder en plein air",
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
      "Je viens de tester le nouveau framework React ! C'est vraiment incroyable a quel point ca simplifie le developpement front-end. Qu'en pensez-vous ?",
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
    content: "Magnifique journee aujourd'hui pour coder en plein air",
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
    content: "Magnifique journee aujourd'hui pour coder en plein air",
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
      "Je viens de tester le nouveau framework React ! C'est vraiment incroyable a quel point ca simplifie le developpement front-end. Qu'en pensez-vous ?",
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
      "Un petit rappel de l'importance du design system : il permet une coherence visuelle et fonctionnelle a travers toutes les interfaces.",
    commentCount: 18,
    shareCount: 402,
    likeCount: 856,
  },
];

const styles = {
  page: "flex h-screen flex-col bg-page-dark",
  header: "sticky top-0 z-20 border-b border-primary/30 bg-page-dark/98 px-4 py-4 backdrop-blur-sm",
  burgerButton:
    "inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
  list: "flex flex-1 flex-col gap-0 overflow-y-auto",
  listItem: "list-none border-b border-primary/20",
  footer: "border-t border-primary/20 bg-page-dark/95 px-4 py-6 text-center",
  overlayBase: "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300",
  sidebarBase: "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out",
};

const overlayVariants = {
  open: "pointer-events-auto opacity-100",
  closed: "pointer-events-none opacity-0",
};

const sidebarVariants = {
  open: "translate-x-0",
  closed: "-translate-x-full",
};

export default function Fil() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handlePostAction = (postId: number, action: string) => {
    console.log(`Action '${action}' sur le post ${postId}`);
  };

  return (
    <>
      <div
        className={`${styles.overlayBase} ${isSidebarOpen ? overlayVariants.open : overlayVariants.closed}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`${styles.sidebarBase} ${isSidebarOpen ? sidebarVariants.open : sidebarVariants.closed}`}
        id={sidebarId}
        role="dialog"
        aria-label="Menu de navigation"
        aria-hidden={!isSidebarOpen}
      >
        <Nav onNavigate={() => setIsSidebarOpen(false)} mode="overlay" />
      </div>

      <main
        className={styles.page}
        role="feed"
        aria-label="Fil d'actualite"
      >
        <header className={styles.header}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className={styles.burgerButton}
              aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isSidebarOpen}
              aria-controls={sidebarId}
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>

            <img
              src="/assets/image 5 (1).png"
              alt="Logo Zbalah"
              className="h-10 w-auto object-contain"
            />
          </div>
        </header>

        <ul className={styles.list} role="list">
          {FEED_POSTS.map((post) => (
            <li key={post.id} className={styles.listItem}>
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

        <footer className={styles.footer}>
          <p className="text-xs text-secondary/50">Fin du fil</p>
        </footer>
      </main>
    </>
  );
}
