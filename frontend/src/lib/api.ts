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
}

export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    user: string;
    mail?: string;
    pp?: string;
  };
}

// Auth
export async function login(email: string, password: string): Promise<{ token: string } | null> {
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
      
      // Message explicite si le compte est bloqué
      if (res.status === 403 && errorData.error?.includes('blocked')) {
        throw new Error('Votre compte a été bloqué. Veuillez contacter le support.');
      }
      
      if (res.status === 403) {
        throw new Error('Accès refusé. Votre compte peut être bloqué ou désactivé.');
      }
      
      throw new Error(`Login failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Login response data:', data);
    
    // Store token in localStorage for API requests (your code uses "token", not "authToken")
    if (data.token) {
      localStorage.setItem('token', data.token);
      return data;
    }
    
    console.warn('Login response missing token:', data);
    return null;
  } catch (err) {
    console.error('Login error:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return null;
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

export async function createPost(content: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
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
        return res.ok;
    } catch (err) {
        console.error('Follow user error:', err);
        return false;
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
