import { useEffect, useState } from "react";
import Post from "../ui/FilActu/post";
import { getPosts, deletePost, getCurrentUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

// Banner image asset
const bannerImage = "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&h=250&fit=crop";

export default function Profil() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(undefined);
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
      <main className="flex min-h-screen items-center justify-center bg-fil text-white">
        <p>Chargement du profil...</p>
      </main>
    );
  }

  if (currentUser === null) {
    return null;
  }

  const userHandle = currentUser?.name?.toLowerCase().replace(/\s/g, '') || currentUser?.mail?.split('@')[0] || 'user';

  return (
    <main className="flex h-screen w-full items-start overflow-hidden bg-fil">
      <article className="flex w-full flex-col overflow-y-auto scrollbar-hide" aria-label="Profil">
        {/* Header avec back, titre et icône user */}
        <header className="sticky top-0 z-20 bg-fil/95 backdrop-blur flex items-center justify-center px-4 py-3 border-b border-primary/20">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <hgroup className="flex flex-col items-center">
            <h1 className="text-base font-bold text-white">{currentUser?.name || 'Utilisateur'}</h1>
            <p className="text-xs text-white/60">{posts.length} posts</p>
          </hgroup>
        </header>

        {/* Banner and Avatar section */}
        <section className="relative pb-12">
          {/* Banner image */}
          <figure className="relative h-48 bg-linear-to-r from-purple-900 via-purple-800 to-purple-900 overflow-hidden">
            <img 
              src={bannerImage}
              alt="Bannière de profil"
              className="w-full h-full object-cover opacity-60"
            />
          </figure>
          
          {/* Avatar - overlaid on banner, outside overflow */}
          <figure className="absolute left-6 top-24 w-28 h-28 rounded-full border-4 border-fil bg-white/20 backdrop-blur-sm overflow-hidden z-50">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'user'}`}
              alt={`Avatar de ${currentUser?.name}`}
              className="w-full h-full object-cover"
            />
          </figure>
        </section>

        {/* User info section */}
        <section className="px-6 pt-6 pb-6 border-b border-primary/20">
          <hgroup className="mb-6">
            <h2 className="text-xl font-bold text-white">{currentUser?.name || 'Utilisateur'}</h2>
            <p className="text-sm text-white/60">@{userHandle}</p>
          </hgroup>

          {/* Info items with icons */}
          <address className="flex flex-wrap gap-4 text-xs text-white/60 mb-6 not-italic">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Localisation
            </span>
            <a href={`https://${currentUser?.mail}`} className="flex items-center gap-1 text-purple-400 hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4.243 4.243a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4.243-4.243a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Site web
            </a>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Membre depuis 2021
            </span>
            <a href={`mailto:${currentUser?.mail}`} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {currentUser?.mail}
            </a>
          </address>

          {/* Follower stats */}
          <dl className="flex gap-8">
            <div>
              <dt className="text-white font-bold text-lg">342</dt>
              <dd className="text-white/60 text-xs">Abonnements</dd>
            </div>
            <div>
              <dt className="text-white font-bold text-lg">12 800</dt>
              <dd className="text-white/60 text-xs">Abonnés</dd>
            </div>
          </dl>
        </section>

        {/* Posts tab */}
        <nav className="border-b border-primary/20 px-6">
          <ul className="flex" role="tablist">
            <li role="presentation">
              <button 
                role="tab"
                aria-selected="true"
                className="py-3 px-0 border-b-2 border-purple-500 text-white font-medium text-sm"
              >
                Posts
              </button>
            </li>
          </ul>
        </nav>

        {/* Posts list */}
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
              <p>Aucun post pour le moment.</p>
            </li>
          )}
        </ul>
      </article>
    </main>
  );
}
