import { useEffect, useId, useState } from "react";
import Post from "../ui/FilActu/post";
import Nav from "../ui/Navbar/nav";
import Suggestions, { type SuggestionUser } from "../ui/Suggestions/suggestions";
import Searchbar from "../ui/Searchbar/searchbar";

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

const SUGGESTED_USERS: SuggestionUser[] = [
  {
    id: "suggestion-1",
    name: "Marie Dubois",
    handle: "marie_d_design",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    ctaLabel: "Suivre",
  },
  {
    id: "suggestion-2",
    name: "Alex Chen",
    handle: "alexc_dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    ctaLabel: "Suivre",
  },
];

export default function Fil() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handlePostAction = (postId: number, action: string) => {
    console.log(`Action '${action}' sur le post ${postId}`);
  };

  const handleFollow = (user: SuggestionUser) => {
    console.log(`Follow ${user.handle}`);
  };

  return (
    <>
      {/* Backdrop mobile — scrim derrière le drawer */}
      <div
        className={
          isSidebarOpen
            ? "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300 lg:hidden pointer-events-auto opacity-100"
            : "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300 lg:hidden pointer-events-none opacity-0"
        }
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* En-tête mobile — flottante au-dessus du fil dans l'espace du mt-16 */}
      <header
        className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-5 pointer-events-none lg:hidden"
        aria-label="En-tête mobile"
      >
        <button
          type="button"
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isSidebarOpen}
          aria-controls={navId}
          onClick={() => setIsSidebarOpen((o) => !o)}
        >
          <svg
            className="h-8 w-8"
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
          className="pointer-events-auto h-9 w-auto object-contain"
        />
      </header>

      {/*
       * Layout principal — flex-row sur desktop, colonne unique sur mobile.
       * La Nav est une seule instance :
       *   mobile  → fixed (drawer glissant)
       *   desktop → static (colonne gauche en flux)
       */}
      <main
        className="flex h-screen items-start overflow-hidden bg-fil justify-center lg:justify-start"
        aria-label="Fil d'actualité"
      >
        {/* Barre de navigation latérale */}
        <Nav
          id={navId}
          position="drawer"
          drawerState={isSidebarOpen ? "open" : "closed"}
          onNavigate={() => setIsSidebarOpen(false)}
        />

        {/* Colonne centrale — fil de posts */}
        <section
          className="flex w-[90vw] max-w-xl shrink-0 flex-col overflow-y-auto scrollbar-hide mt-24 border-x border-t border-primary/20 lg:mt-0 lg:w-[52rem] lg:max-w-none lg:border-t-0"
          aria-label="Posts"
        >
          {/* Liste des posts */}
          <ul className="flex flex-col" role="list">
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

          <footer className="border-t border-primary/20 px-4 py-6 text-center">
            <p className="text-xs text-secondary/50">Fin du fil</p>
          </footer>
        </section>

        {/* Colonne droite — desktop uniquement */}
        <aside
          className="hidden lg:flex lg:w-[28rem] lg:shrink-0 lg:flex-col lg:gap-4 lg:overflow-y-auto lg:scrollbar-hide lg:border-l lg:border-primary/20 lg:p-4"
          aria-label="Recherche et suggestions"
        >
          <Searchbar variant="subtle" size="sm" placeholder="Rechercher" />
          <Suggestions
            suggestions={SUGGESTED_USERS}
            size="md"
            rowDensity="compact"
            followVariant="lavender"
            followSize="sm"
            onFollow={handleFollow}
          />
        </aside>
      </main>
    </>
  );
}
