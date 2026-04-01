import { useEffect, useId, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import PostWrapper from "../ui/Post/PostWrapper";
import Nav from "../ui/Navigation/nav";
import Suggestions, { type SuggestionUser } from "../ui/Suggestions/suggestions";
import { getPosts, deletePost } from "../../lib/api";
import { useStore } from "../../store/StoreContext";


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

const refreshButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-primary/20 text-primary font-medium transition-all',
  {
    variants: {
      state: {
        loading: 'bg-primary/20 opacity-60 cursor-not-allowed',
        idle: 'hover:bg-primary/10 hover:border-primary/40 cursor-pointer',
      },
    },
    defaultVariants: {
      state: 'idle',
    },
  },
);

export default function Fil() {
  const { posts, setPosts, currentUser, removePost } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(
    localStorage.getItem("autoRefreshInterval")
      ? parseInt(localStorage.getItem("autoRefreshInterval")!)
      : null
  );
  const navId = useId();
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = async (page: number = 1) => {
    try {
      const data = await getPosts(page);
      return data;
    } catch (error) {
      console.error("Erreur réseau :", error);
      return { posts: [], pagination: {} };
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialPosts = async () => {
      const data = await fetchPosts(1);
      const posts = data.posts || [];
      const totalItems = data.pagination?.total_items || 0;
      setPosts(posts);
      setCurrentPage(1);
      setHasMore(totalItems > 20);
      console.log("Initial load - Total items:", totalItems, "Posts loaded:", posts.length);
    };
    loadInitialPosts();
  }, []);

  // Load more posts (infinite scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isRefreshing) {
          console.log("Loading more posts - Page:", currentPage + 1);
          setIsLoadingMore(true);
          const nextPage = currentPage + 1;
          try {
            const data = await fetchPosts(nextPage);
            const newPosts = data.posts || [];
            if (newPosts.length > 0) {
              setPosts((prev) => [...prev, ...newPosts]);
              setCurrentPage(nextPage);
              const totalItems = data.pagination?.total_items || 0;
              setHasMore((nextPage * 20) < totalItems);
              console.log("Loaded", newPosts.length, "posts. Total items:", totalItems);
            } else {
              setHasMore(false);
              console.log("No more posts to load");
            }
          } catch (error) {
            console.error("Error loading more posts:", error);
          } finally {
            setIsLoadingMore(false);
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: "300px"
      }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
      console.log("Observer attached to target");
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [currentPage, hasMore, isLoadingMore, isRefreshing]);

  // Rafraîchissement automatique optionnel
  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(async () => {
      const data = await fetchPosts(1);
      setPosts(data.posts || []);
      setCurrentPage(1);
      setHasMore((data.pagination?.total_items || 0) > 20);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await fetchPosts(1);
    setPosts(data.posts || []);
    setCurrentPage(1);
    setHasMore((data.pagination?.total_items || 0) > 20);
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
        removePost(postId);
      } else {
        alert("Erreur lors de la suppression du post.");
      }
    }
  };

  return (
    <>
      {/* Backdrop mobile — scrim derrière le drawer */}
      <section
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
          src={`${import.meta.env.BASE_URL}/assets/logo.png`}
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
          className="flex w-full h-screen max-w-2xl shrink-0 flex-col overflow-y-auto scrollbar-hide mt-24 border-x border-t border-primary/20 lg:mt-0 lg:max-w-4xl lg:border-t-0"
          aria-label="Posts"
        >
          {/* Bouton de rafraîchissement et menu des options */}
          <section className="sticky top-0 z-10 border-b border-primary/20 bg-fil/95 backdrop-blur px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Fil d'actualité</h2>
            <section className="flex items-center gap-2">
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
                className={cn(refreshButtonVariants({ state: isRefreshing ? 'loading' : 'idle' }))}
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
            </section>
          </section>

          {/* Liste des posts provenant de l'API */}
          <ul className="flex flex-col" role="list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <li key={post.id} className="list-none border-b border-primary/20">
                  <PostWrapper
                    postId={post.id}
                    authorName={post.author?.name || "Utilisateur"}
                    authorHandle={post.author?.name ? post.author.name.toLowerCase().replace(/\s/g, '') : "user"}
                    authorId={post.author?.id}
                    authorAvatar={post.author?.profilePhoto || post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || "User"}`}
                    timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "Date inconnue"}
                    content={post.content || ""}
                      mediaUrl={post.mediaUrl || undefined}
                    commentCount={post.replies || 0}
                    shareCount={0}
                    isCensored={post.isCensored || false}
                      isCurrentUserAuthor={!!(currentUser && post.author?.id === currentUser.id)}
                    isAuthorBlocked={post.isAuthorBlocked || false}
                    onComment={() => {}}
                    onShare={() => {}}
                    onDelete={
                      currentUser && post.author?.id === currentUser.id
                        ? () => handleDeletePost(post.id)
                        : undefined
                    }
                    onPostUpdated={(updatedPost) => {
                      setPosts((prev) =>
                        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                      );
                    }}
                  />
                </li>
              ))
            ) : (
              <p className="p-8 text-center text-secondary/70">Aucun post disponible. Soyez le premier à publier !</p>
            )}
          </ul>

          {/* Infinite scroll target */}
          <section ref={observerTarget} className="py-8 text-center">
            {isLoadingMore && (
              <section className="flex items-center justify-center gap-2">
                <section className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-secondary" />
                <span className="text-secondary/70">Chargement...</span>
              </section>
            )}
            {!isLoadingMore && !hasMore && posts.length > 0 && (
              <p className="text-xs text-secondary/50">Fin du fil</p>
            )}
          </section>
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
