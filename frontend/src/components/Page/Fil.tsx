import { useEffect, useId, useState } from "react";
import Post from "../ui/FilActu/post";
import Nav from "../ui/Navbar/nav";
import Suggestions, { type SuggestionUser } from "../ui/Suggestions/suggestions";
import Searchbar from "../ui/Searchbar/searchbar";


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
  const [posts, setPosts] = useState<any[]>([]); // Nouvel état pour les posts du backend
  const navId = useId();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://mmi.unilim.fr/~zbalah3/sae4-dweb-di-01-social-AddemZbalah/backend/public/api/posts", {
          headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          const data = await response.json();
          // L'API renvoie { posts: [...], pagination: {...} }
          setPosts(data.posts || []);
        } else {
          console.error("Erreur lors de la récupération des posts", response.status);
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      }
    };

    fetchPosts();
  }, []);

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
          {/* Liste des posts provenant de l'API */}
          <ul className="flex flex-col" role="list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <li key={post.id} className="list-none border-b border-primary/20">
                  <Post
                    authorName={post.author?.name || "Utilisateur"}
                    authorHandle={post.author?.name ? post.author.name.toLowerCase().replace(/\s/g, '') : "user"}
                    authorAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || "User"}`}
                    timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "Date inconnue"}
                    content={post.content || ""}
                    commentCount={0} // À implémenter plus tard côté backend
                    shareCount={0}
                    likeCount={0}
                    onComment={() => handlePostAction(post.id, "comment")}
                    onShare={() => handlePostAction(post.id, "share")}
                    onLike={() => handlePostAction(post.id, "like")}
                    onMoreActions={() => handlePostAction(post.id, "more")}
                  />
                </li>
              ))
            ) : (
              <p className="p-8 text-center text-secondary/70">Aucun post disponible. Soyez le premier à publier !</p>
            )}
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
