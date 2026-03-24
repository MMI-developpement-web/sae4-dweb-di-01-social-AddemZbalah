import { useEffect, useState } from "react";
import Post from "../ui/FilActu/post";
import { getPosts, deletePost, getCurrentUser } from "../../lib/api";
import { useNavigate, useParams } from "react-router-dom";

// Banner image asset
const bannerImage = "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&h=250&fit=crop";

// Mock function to fetch user details (will be replaced with API call)
async function getUserById(userId: number): Promise<any> {
  try {
    // This will be implemented on the backend
    // For now, we'll return a mock user
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      }
    );
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return null;
  }
}

export default function Profil() {
  const { userId } = useParams<{ userId?: string }>();
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [displayedUser, setDisplayedUser] = useState<any>(undefined);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const navigate = useNavigate();

  // Fetch current user
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

  // Fetch user to display and their posts
  useEffect(() => {
    async function fetchUserData() {
      try {
        let userToDisplay = currentUser;
        
        // If userId is provided, fetch that user instead
        if (userId && currentUser) {
          const userFromApi = await getUserById(parseInt(userId));
          if (userFromApi) {
            userToDisplay = userFromApi;
          } else {
            // Fallback to mock if API fails
            userToDisplay = {
              id: parseInt(userId),
              name: "Utilisateur",
              mail: "user@example.com"
            };
          }
        }

        setDisplayedUser(userToDisplay);

        // Fetch posts for displayed user
        if (userToDisplay?.id) {
          const data = await getPosts(1, userToDisplay.id);
          setPosts(data.posts || []);
        }

        // Check if current user is following this user (mock for now)
        if (userId && currentUser && parseInt(userId) !== currentUser.id) {
          const followingList = JSON.parse(localStorage.getItem("following") || "[]");
          setIsFollowing(followingList.includes(parseInt(userId)));
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }

    if (currentUser !== undefined) {
      fetchUserData();
    }
  }, [userId, currentUser]);

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

  const handleFollowToggle = async () => {
    if (!displayedUser || !currentUser) return;
    
    setIsLoadingFollow(true);
    try {
      // Mock local storage follow/unfollow
      // This will be replaced with API calls
      const followingList = JSON.parse(localStorage.getItem("following") || "[]");
      const isCurrentlyFollowing = followingList.includes(displayedUser.id);
      
      if (isCurrentlyFollowing) {
        const newList = followingList.filter((id: number) => id !== displayedUser.id);
        localStorage.setItem("following", JSON.stringify(newList));
        setIsFollowing(false);
      } else {
        followingList.push(displayedUser.id);
        localStorage.setItem("following", JSON.stringify(followingList));
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const isOtherUserProfile = userId && currentUser && parseInt(userId) !== currentUser.id;

  if (currentUser === undefined || displayedUser === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fil text-white">
        <p>Chargement du profil...</p>
      </main>
    );
  }

  if (currentUser === null) {
    return null;
  }

  const userHandle = displayedUser?.name?.toLowerCase().replace(/\s/g, '') || displayedUser?.mail?.split('@')[0] || 'user';

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
            <h1 className="text-base font-bold text-white">{displayedUser?.name || 'Utilisateur'}</h1>
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
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayedUser?.name || 'user'}`}
              alt={`Avatar de ${displayedUser?.name}`}
              className="w-full h-full object-cover"
            />
          </figure>
        </section>

        {/* User info section */}
        <section className="px-6 pt-6 pb-6 border-b border-primary/20">
          <div className="flex items-start justify-between mb-6">
            <hgroup>
              <h2 className="text-xl font-bold text-white">{displayedUser?.name || 'Utilisateur'}</h2>
              <p className="text-sm text-white/60">@{userHandle}</p>
            </hgroup>
            
            {/* Follow button for other user profiles */}
            {isOtherUserProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={isLoadingFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  isFollowing
                    ? "border border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                } disabled:opacity-60`}
              >
                {isLoadingFollow ? "..." : isFollowing ? "Ne plus suivre" : "Suivre"}
              </button>
            )}
          </div>

          {/* Info items with icons */}
          <address className="flex flex-wrap gap-4 text-xs text-white/60 mb-6 not-italic">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Localisation
            </span>
            <a href={`https://${displayedUser?.mail}`} className="flex items-center gap-1 text-purple-400 hover:underline">
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
            <a href={`mailto:${displayedUser?.mail}`} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {displayedUser?.mail}
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
                  authorId={post.author?.id}
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
