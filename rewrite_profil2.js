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
  const [currentUser, setCurrentUser] = useState<any>(undefined);
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
      <main className="flex min-h-screen items-center justify-center bg-fil text-white" aria-label="Chargement">
        <p>Chargement du profil...</p>
      </main>
    );
  }

  if (currentUser === null) {
    return null;
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
          aria-expanded={isSidebarOpen}
          aria-controls={navId}
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
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

      <main
        className="flex h-screen items-start overflow-hidden bg-fil justify-center lg:justify-start"
        aria-label="Profil utilisateur"
      >
        <Nav
          id={navId}
          position="drawer"
          drawerState={isSidebarOpen ? "open" : "closed"}
          onNavigate={() => setIsSidebarOpen(false)}
        />

        <section
          className="flex w-[90vw] max-w-xl shrink-0 flex-col overflow-y-auto scrollbar-hide mt-24 border-x border-t border-primary/20 lg:mt-0 lg:w-[52rem] lg:max-w-none lg:border-t-0"
          aria-label="Contenu du profil"
        >
          <header className="sticky top-0 z-10 bg-fil/90 backdrop-blur border-b border-primary/20 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Profil</h1>
          </header>

          <article className="px-6 py-8 border-b border-primary/20 flex flex-col items-start gap-4">
             <figure className="h-28 w-28 rounded-full bg-white/10 shrink-0" aria-label="Avatar de l'utilisateur" />
             <p className="text-white text-[15px]">
               <strong className="font-bold">{posts.length}</strong> <span className="text-white/70">Posts</span>
             </p>
          </article>

          <ul className="flex flex-col" role="list">
            {posts.length > 0 ? (
              posts.map((post) => (
                <li key={post.id} className="list-none border-b border-primary/20">
                  <Post
                    authorName={post.author?.name || "Utilisateur"}
                    authorHandle={post.author?.name ? post.author.name.toLowerCase().replace(/\\s/g, '') : "user"}
                    authorAvatar={\`https://api.dicebear.com/7.x/avataaars/svg?seed=\${post.author?.name || "User"}\`}
                    timestamp={post.createdAt ? new Date(post.createdAt).toLocaleDateString("fr-FR", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "Date inconnue"}
                    content={post.content || ""}
                    commentCount={0}
                    shareCount={0}
                    likeCount={0}
                    onDelete={
                      currentUser && post.author?.id === currentUser.id
                        ? () => handleDeletePost(post.id)
                        : undefined
                    }
                  />
                </li>
              ))
            ) : (
              <li className="p-8 text-center text-secondary/70">
                <p>Aucun post disponible pour le moment.</p>
              </li>
            )}
          </ul>
        </section>

        <aside className="hidden w-80 shrink-0 flex-col gap-8 p-6 lg:flex xl:w-96" aria-label="Recherche">
          <Searchbar placeholder="Chercher dans vos posts" />
        </aside>
      </main>
    </>
  );
}
`;

fs.writeFileSync('/workspaces/sae4-dweb-di-01-social-AddemZbalah/frontend/src/components/Page/Profil.tsx', code);
