const fs = require('fs');

const code = `import { useEffect, useState, useId } from "react";
import Post from "../ui/FilActu/post";
import Nav from "../ui/Navbar/nav";
import Searchbar from "../ui/Searchbar/searchbar";
import { getPosts, deletePost, getCurrentUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profil() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(undefined); // undefined means loading
  const navId = useId();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
          navigate("/connexion");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        setCurrentUser(null);
        navigate("/connexion");
      }
    }
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchPosts = async () => {
      try {
        const data = await getPosts(1, currentUser.id);
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Network error:", error);
      }
    };

    fetchPosts();
  }, [currentUser]);

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

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0812] text-white">
        Chargement du profil...
      </div>
    );
  }

  if (currentUser === null) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <>
      <div
        className={
          isSidebarOpen
            ? "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300 lg:hidden pointer-events-auto opacity-100"
            : "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300 lg:hidden pointer-events-none opacity-0"
        }
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <header
        className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-5 pointer-events-none lg:hidden"
      >
        <button
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-white/10"
          onClick={() => setIsSidebarOpen((o) => !o)}
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isSidebarOpen}
          aria-controls={navId}
        >
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </header>

      <div className="flex min-h-screen items-start overflow-hidden bg-[#0d0812] justify-center lg:justify-start">
        {/* Navigation Sidebar */}
        <Nav
          id={navId}
          position="drawer"
          drawerState={isSidebarOpen ? "open" : "closed"}
          onNavigate={() => setIsSidebarOpen(false)}
        />

        {/* Colonne centrale */}
        <main className="flex w-[90vw] max-w-xl shrink-0 flex-col overflow-y-auto scrollbar-hide mt-16 border-x border-[rgba(132,74,196,0.2)] lg:mt-0 lg:w-[52rem] lg:max-w-none">
          <header className="relative w-full pb-6 pt-5 px-6 border-b border-[rgba(132,74,196,0.15)] flex flex-col gap-4">
            
            {/* Header Top avec Nom et Bouton Modifier */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-[22px] font-bold text-[#f3daff] leading-tight">
                  {currentUser?.name || "Utilisateur"}
                </h1>
                <p className="text-[15px] font-normal text-[rgba(243,218,255,0.5)]">
                  @{currentUser?.name?.toLowerCase().replace(/\s/g, "") || currentUser?.mail?.split("@")[0] || "user"}
                </p>
              </div>
              <button className="px-5 py-2 rounded-full border border-[rgba(132,74,196,0.6)] text-[#f3daff] text-sm font-semibold hover:bg-[rgba(132,74,196,0.1)] transition-colors">
                Modifier le profil
              </button>
            </div>

            {/* Infos supplémentaires de l'utilisateur (Email uniquement recupéré pour l'instant) */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-[15px] h-[15px] text-[rgba(243,218,255,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={"mailto:" + currentUser?.mail} className="text-[14px] font-normal text-[rgba(243,218,255,0.5)] hover:underline">
                  {currentUser?.mail || "Non renseigné"}
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[16px] font-semibold text-[#f3daff]">0</span>
                <span className="text-[16px] font-medium text-[rgba(243,218,255,0.5)]">Abonnements</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[16px] font-semibold text-[#f3daff]">0</span>
                <span className="text-[16px] font-medium text-[rgba(243,218,255,0.5)]">Abonnés</span>
              </div>
            </div>
            
          </header>

          {/* Onglet Posts */}
          <nav className="flex flex-col border-b border-[rgba(132,74,196,0.2)]">
            <div className="w-[373px] max-w-full">
              <div className="h-[47px] border-b-2 border-[#844ac4] flex items-center justify-center">
                <span className="text-[14px] font-medium text-[#f3daff]">Posts</span>
              </div>
            </div>
          </nav>

          {/* Liste des posts */}
          <section className="flex flex-col" aria-label="Posts de l'utilisateur">
            <ul className="flex flex-col" role="list">
              {posts.length === 0 ? (
                <p className="p-8 text-center text-secondary/70">Aucun post disponible. Soyez le premier à publier !</p>
              ) : (
                posts.map((post) => (
                  <li key={post.id} className="list-none border-b border-[rgba(132,74,196,0.15)]">
                    <Post
                      authorName={post.author?.name || "Utilisateur"}
                      authorHandle={post.author?.name ? post.author.name.toLowerCase().replace(/\s/g, '') : "user"}
                      authorAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || "User"}`}
                      timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "Date inconnue"}
                      content={post.content}
                      commentCount={0}
                      shareCount={0}
                      likeCount={0}
                      onDelete={
                        post.author?.id === currentUser.id
                          ? () => handleDeletePost(post.id)
                          : undefined
                      }
                    />
                  </li>
                ))
              )}
            </ul>
          </section>
        </main>
        
        {/* Colonne droite — desktop uniquement */}
        <aside className="hidden w-80 shrink-0 flex-col gap-8 p-6 lg:flex xl:w-96">
          <Searchbar placeholder="Rechercher sur Zbalah" />
        </aside>
      </div>
    </>
  );
}
`;

fs.writeFileSync('/workspaces/sae4-dweb-di-01-social-AddemZbalah/frontend/src/components/Page/Profil.tsx', code);
