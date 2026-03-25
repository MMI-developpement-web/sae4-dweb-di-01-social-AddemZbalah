import { useEffect, useId, useState } from "react";
import Post from "../ui/FilActu/post";
import Nav from "../ui/Navbar/nav";
import Suggestions, { type SuggestionUser } from "../ui/Suggestions/suggestions";
import { getPosts, deletePost, getCurrentUser } from "../../lib/api";


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
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(
    localStorage.getItem("autoRefreshInterval") 
      ? parseInt(localStorage.getItem("autoRefreshInterval")!) 
      : null
  );
  const navId = useId();

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          // Optional: navigate("/connexion"); if we strictly require login here
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      // L'API renvoie { posts: [...], pagination: {...} }
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Rafraîchissement automatique optionnel
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      fetchPosts();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
  };

  const toggleAutoRefresh = (intervalSeconds: number | null) => {
    setAutoRefreshInterval(intervalSeconds);
    if (intervalSeconds) {
      localStorage.setItem("autoRefreshInterval", intervalSeconds.toString());
    } else {
      localStorage.removeItem("autoRefreshInterval");
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleDeletePost = async (postId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tweet ?")) {
      const success = await deletePost(postId);
      if (success) {
        setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
      } else {
        alert("Erreur lors de la suppression du post.");
      }
    }
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
          src={`${import.meta.env.BASE_URL}assets/image 5 (1).png`}
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
          className="flex w-full max-w-2xl shrink-0 flex-col overflow-y-auto scrollbar-hide mt-24 border-x border-t border-primary/20 lg:mt-0 lg:max-w-4xl lg:border-t-0"
          aria-label="Posts"
        >
          {/* Bouton de rafraîchissement et menu des options */}
          <div className="sticky top-0 z-10 border-b border-primary/20 bg-fil/95 backdrop-blur px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Fil d'actualité</h2>
            <div className="flex items-center gap-2">
              {/* Menu de rafraîchissement automatique */}
              <select
                value={autoRefreshInterval || ""}
                onChange={(e) => toggleAutoRefresh(e.target.value ? parseInt(e.target.value) : null)}
                className="text-sm px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                aria-label="Options de rafraîchissement automatique"
              >
                <option value="">Auto-rafraîchissement</option>
                <option value="30">Toutes les 30 secondes</option>
                <option value="60">Toutes les 1 minute</option>
                <option value="300">Toutes les 5 minutes</option>
              </select>

              {/* Bouton de rafraîchissement manuel */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-primary/20 text-primary font-medium transition-all ${
                  isRefreshing
                    ? "bg-primary/20 opacity-60 cursor-not-allowed"
                    : "hover:bg-primary/10 hover:border-primary/40 cursor-pointer"
                }`}
                aria-label="Rafraîchir le fil"
                type="button"
              >
                <svg
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2-8.83" />
                </svg>
                <span className="hidden sm:inline">Rafraîchir</span>
              </button>
            </div>
          </div>

          {/* Liste des posts provenant de l'API */}
          <ul className="flex flex-col" role="list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <li key={post.id} className="list-none border-b border-primary/20">
                  <Post
                    postId={post.id}
                    authorName={post.author?.name || "Utilisateur"}
                    authorHandle={post.author?.name ? post.author.name.toLowerCase().replace(/\s/g, '') : "user"}
                    authorId={post.author?.id}
                    authorAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || "User"}`}
                    timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "Date inconnue"}
                    content={post.content || ""}
                    commentCount={0} // À implémenter plus tard côté backend
                    shareCount={0}
                    onComment={() => {}}
                    isAuthorBlocked={post.isAuthorBlocked || false}
                    onShare={() => {}}
                    onDelete={
                      currentUser && post.author?.id === currentUser.id
                        ? () => handleDeletePost(post.id)
                        : undefined
                    }
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
          className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:gap-4 lg:overflow-y-auto lg:scrollbar-hide lg:border-l lg:border-primary/20 lg:p-4"
          aria-label="Suggestions"
        >
          <Suggestions
            suggestions={SUGGESTED_USERS}
            size="md"
            rowDensity="compact"
            followVariant="lavender"
            followSize="sm"
          />
        </aside>
      </main>
    </>
  );
}
