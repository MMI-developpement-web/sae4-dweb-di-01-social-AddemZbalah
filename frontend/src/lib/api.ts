// API utility for calling backend endpoints

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export { API_BASE };

export interface User {
  id: number;
  username?: string;  // From login endpoint
  user?: string;      // From other endpoints (backward compat)
  email?: string;
  mail?: string;
  name?: string;
  firstname?: string;
  role?: 'user' | 'admin';
  active?: boolean;
  phone?: string;
  birthDate?: string;
  /** photo de profil (champ 'pp' dans la base) */
  pp?: string;
  profilePhoto?: string;
  avatar?: string;
  bio?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
  createdAt?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isReadOnly?: boolean;     // US 2.3: Mode lecture seule
  isPrivate?: boolean;      // Mode compte privé
}

export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  isPinned?: boolean;       // US 3.6: Post épinglé
  retweetOf?: number;       // Retweet: ID du post original
  author: {
    id: number;
    name: string;
    user: string;
    mail?: string;
    pp?: string;
  };
}

// Auth
export interface LoginResponse {
  token?: string;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    console.log('Attempt login with email:', email);
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', res.status, res.ok);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Login failed:', res.status, errorData);
      // Return error message from backend if available
      const errorMessage = errorData.error || `Erreur de connexion: ${res.status}`;
      return { error: errorMessage };
    }
    
    const data = await res.json();
    console.log('Login response data:', data);
    
    // Store token in localStorage for API requests (your code uses "token", not "authToken")
    if (data.token) {
      localStorage.setItem('token', data.token);
      return { token: data.token };
    }
    
    console.warn('Login response missing token:', data);
    return { error: 'Token manquant dans la réponse' };
  } catch (err) {
    console.error('Login error:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      return { error: err.message };
    }
    return { error: 'Erreur inconnue lors de la connexion' };
  }
}

export async function register(data: any): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Register failed');
    const responseData = await res.json();
    
    if (responseData.token) {
      localStorage.setItem('token', responseData.token);
    }
    
    return responseData;
  } catch (err) {
    console.error('Register error:', err);
    return null;
  }
}

// Token management
export function getAuthToken(): string | null {
  // Your code historically uses 'token', not 'authToken'
  return localStorage.getItem('token');
}

export function clearAuthToken() {
  localStorage.removeItem('token');
}

// Helper to get headers with auth token
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function logout(): void {
  clearAuthToken();
}

// Posts
export async function getPosts(page: number = 1, authorId?: number): Promise<any> {
  try {
    const url = authorId 
      ? `${API_BASE}/posts?page=${page}&author_id=${authorId}` 
      : `${API_BASE}/posts?page=${page}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch posts failed');
    return await res.json();
  } catch (err) {
    console.error('Get posts error:', err);
    return { posts: [] };
  }
}

// Get only the number of posts for an author (uses pagination.total_items when available)
export async function getPostsCount(authorId?: number): Promise<number> {
  try {
    const url = authorId 
      ? `${API_BASE}/posts?page=1&author_id=${authorId}` 
      : `${API_BASE}/posts?page=1`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch posts count failed');
    const data = await res.json();
    if (data && data.pagination && typeof data.pagination.total_items === 'number') {
      return data.pagination.total_items;
    }
    if (data && Array.isArray(data.posts)) return data.posts.length;
    return 0;
  } catch (err) {
    console.error('Get posts count error:', err);
    return 0;
  }
}

export async function deletePost(postId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (err) {
    console.error('Delete post error:', err);
    return false;
  }
}

// Helper function to convert File to Base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createPost(content: string, mediaUrl?: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, mediaUrl: mediaUrl || null }),
    });
    
    if (!res.ok) {
         let errorMessage = "Erreur création post";
         try {
           const errData = await res.json();
           errorMessage = errData.error || errorMessage;
         } catch(e) {}
         throw new Error(errorMessage);
    }
    return res;
  } catch (err) {
    console.error('Create post error:', err);
    throw err;
  }
}

// Get Current Logged User Info (from our /api/user route)
export async function getCurrentUser(): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/user`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

// Get User by ID
export async function getUserById(userId: number): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Get user by ID error:', err);
        return null;
    }
}

// Follow a user
export async function followUser(userId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) {
            if (res.status === 403) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Vous avez bloqué cet utilisateur');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erreur lors du suivi');
        }
        return true;
    } catch (err) {
        if (err instanceof Error) {
            console.error('Follow user error:', err.message);
            throw err;
        }
        console.error('Follow user error:', err);
        throw new Error('Erreur lors du suivi');
    }
}

// Unfollow a user
export async function unfollowUser(userId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/unfollow`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Unfollow user error:', err);
        return false;
    }
}

// Check if current user is following a user
export async function isFollowingUser(userId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/is-following`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.isFollowing || false;
    } catch (err) {
        console.error('Check following status error:', err);
        return false;
    }
}

// Get list of users that a specific user is following
export async function getFollowingUsers(userId: number): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/following`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error('Get following users error:', err);
        return [];
    }
}

// Update user profile
export async function updateUserProfile(profileData: {
    bio?: string;
    profilePhoto?: string;
    bannerImage?: string;
    location?: string;
    website?: string;
}): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/user/update`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Update profile error:', err);
        return null;
    }
}

// Update user profile (new endpoint)
export async function updateUserProfileV2(profileData: {
    bio?: string;
    profilePhoto?: string;
    bannerImage?: string;
    location?: string;
    website?: string;
}): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Update profile error:', err);
        return null;
    }
}

// Block a user
export async function blockUser(userId: number): Promise<boolean> {
    try {
        console.log(`Attempting to block user ${userId}`);
        const res = await fetch(`${API_BASE}/users/${userId}/block`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        console.log(`Block response status: ${res.status}`);
        if (!res.ok) {
            const error = await res.text();
            console.error(`Block failed with status ${res.status}:`, error);
        }
        return res.ok;
    } catch (err) {
        console.error('Block user error:', err);
        return false;
    }
}

// Unblock a user
export async function unblockUser(userId: number): Promise<boolean> {
    try {
        console.log(`Attempting to unblock user ${userId}`);
        const res = await fetch(`${API_BASE}/users/${userId}/block`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        console.log(`Unblock response status: ${res.status}`);
        if (!res.ok) {
            const error = await res.text();
            console.error(`Unblock failed with status ${res.status}:`, error);
        }
        return res.ok;
    } catch (err) {
        console.error('Unblock user error:', err);
        return false;
    }
}

// Get list of blocked users
export async function getBlockedUsers(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/users/blocked-users`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error('Get blocked users error:', err);
        return [];
    }
}

// Check if current user is blocking another user
export async function isBlockingUser(userId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/is-blocking`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.isBlocking || false;
    } catch (err) {
        console.error('Check blocking status error:', err);
        return false;
    }
}

// Edit a post
export async function editPost(postId: number, content: string, mediaUrl?: string): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ content, mediaUrl: mediaUrl || null }),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Edit post error:', err);
        return null;
    }
}

// Create reply to a post
export async function createReply(postId: number, textContent: string): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ textContent }),
        });
        if (!res.ok) {
            if (res.status === 403) {
                const errorData = await res.json();
                console.error('Error 403:', errorData.error);
                throw new Error(errorData.error || 'Vous avez été bloqué par cet utilisateur');
            }
            return null;
        }
        return await res.json();
    } catch (err) {
        if (err instanceof Error) {
            console.error('Create reply error:', err.message);
            throw err;
        }
        console.error('Create reply error:', err);
        return null;
    }
}

// Get replies for a post
export async function getReplies(postId: number): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        console.error('Get replies error:', err);
        return [];
    }
}

// Delete reply
export async function deleteReply(replyId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/replies/${replyId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Delete reply error:', err);
        return false;
    }
}

// Censor a post (admin only)
export async function censorPost(postId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/censor`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Censor post error:', err);
        return false;
    }
}

// Uncensor a post (admin only)
export async function uncensorPost(postId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/censor`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Uncensor post error:', err);
        return false;
    }
}

// ============ NEW ENDPOINTS FOR USER STORIES =============

// US 2.3: Compte en lecture seule - Get user settings
export async function getUserSettings(): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/users/settings`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Get user settings error:', err);
        return null;
    }
}

// US 2.3: Compte en lecture seule - Update user settings
export async function updateUserSettings(settings: {
    isReadOnly?: boolean;
    isPrivate?: boolean;
}): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/users/settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Update user settings error:', err);
        return null;
    }
}

// US 3.6: Épingler un post
export async function pinPost(postId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/pin`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Pin post error:', err);
        return false;
    }
}

// US 3.6: Désépingler un post
export async function unpinPost(postId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/pin`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Unpin post error:', err);
        return false;
    }
}

// Retweet a post
export async function retweetPost(postId: number, comment?: string): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/retweet`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ comment: comment || null }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Erreur lors du retweet');
        }
        return await res.json();
    } catch (err) {
        if (err instanceof Error) {
            console.error('Retweet post error:', err.message);
            throw err;
        }
        console.error('Retweet post error:', err);
        return null;
    }
}

// Remove a retweet
export async function unretweetPost(retweetId: number): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/posts/${retweetId}/retweet`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (err) {
        console.error('Unretweet post error:', err);
        return false;
    }
}

// US 4.3: Search posts with filters
export async function searchPosts(query: string, options?: {
    type?: 'tweet' | 'user' | 'hashtag';
    dateFrom?: string;
    dateTo?: string;
    authorId?: number;
    page?: number;
    perPage?: number;
}): Promise<any> {
    try {
        const params = new URLSearchParams();
        params.append('q', query || '');
        if (options?.type) params.append('type', options.type);
        if (options?.dateFrom) params.append('date_from', options.dateFrom);
        if (options?.dateTo) params.append('date_to', options.dateTo);
        if (options?.authorId) params.append('author_id', options.authorId.toString());
        params.append('page', (options?.page || 1).toString());
        params.append('per_page', (options?.perPage || 20).toString());

        const res = await fetch(`${API_BASE}/search/posts?${params}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return { posts: [] };
        return await res.json();
    } catch (err) {
        console.error('Search posts error:', err);
        return { posts: [] };
    }
}
