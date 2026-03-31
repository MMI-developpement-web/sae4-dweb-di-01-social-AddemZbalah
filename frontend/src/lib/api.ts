// API utility for calling backend endpoints

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export { API_BASE };

// Helper for simple GET requests
async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Fetch error: ${url}`, err);
    return null;
  }
}

// Helper for simple requests (POST/DELETE) that return status
async function apiRequest(url: string, method: 'POST' | 'DELETE'): Promise<boolean> {
  try {
    const res = await fetch(url, { method, headers: getAuthHeaders() });
    return res.ok;
  } catch (err) {
    console.error(`Request error: ${method} ${url}`, err);
    return false;
  }
}

export interface User {
  id: number;
  // username?: string;  // unused - from registration only
  // user?: string;      // unused - legacy backward compat
  // email?: string;     // unused - use mail instead
  // firstname?: string; // unused
  name: string;
  mail?: string;
  // active?: boolean;   // unused
  // phone?: string;     // unused
  // birthDate?: string; // unused
  // pp?: string;        // unused - legacy alias for profilePhoto
  profilePhoto?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  bio?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
  createdAt?: string;
  // postsCount?: number;      // unused - cached in localStorage
  // followersCount?: number;  // unused
  // followingCount?: number;  // unused
}

export interface Post {
  id: number;
  content: string;
  // time?: string;  // unused - use createdAt
  createdAt: string;
  author: {
    id: number;
    name: string;
    // user?: string;  // unused - legacy alias
    mail?: string;
    // pp?: string;    // unused - legacy alias for profilePhoto
    profilePhoto?: string;
  };
}

// Auth
export interface LoginResponse {
  token?: string;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.error || `Erreur de connexion: ${res.status}`;
      return { error: errorMessage };
    }
    
    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      return { token: data.token };
    }
    
    return { error: 'Token manquant dans la réponse' };
  } catch (err) {
    console.error('Login error:', err);
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la connexion';
    return { error: message };
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
export async function getPosts(page: number = 1, authorId?: number) {
  const url = authorId 
    ? `${API_BASE}/posts?page=${page}&author_id=${authorId}` 
    : `${API_BASE}/posts?page=${page}`;
  const data = await fetchJSON(url);
  return data || { posts: [] };
}

// Get only the number of posts for an author
export async function getPostsCount(authorId?: number): Promise<number> {
  const url = authorId 
    ? `${API_BASE}/posts?page=1&author_id=${authorId}` 
    : `${API_BASE}/posts?page=1`;
  const data = await fetchJSON(url);
  if (data?.pagination?.total_items) return data.pagination.total_items;
  return Array.isArray(data?.posts) ? data.posts.length : 0;
}

export async function deletePost(postId: number): Promise<boolean> {
  return apiRequest(`${API_BASE}/posts/${postId}`, 'DELETE');
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
      } catch {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err) {
    console.error('Create post error:', err);
    throw err;
  }
}

// Get Current Logged User Info
export async function getCurrentUser(): Promise<User | null> {
    return fetchJSON(`${API_BASE}/user`);
}

// Get User by ID
export async function getUserById(userId: number): Promise<User | null> {
    return fetchJSON(`${API_BASE}/users/${userId}`);
}

// Follow a user
export async function followUser(userId: number) {
    try {
        const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const message = res.status === 403 
                ? errorData.error || 'Vous avez bloqué cet utilisateur'
                : errorData.error || 'Erreur lors du suivi';
            throw new Error(message);
        }
        return true;
    } catch (err) {
        console.error('Follow user error:', err);
        throw err;
    }
}

// Unfollow a user
export async function unfollowUser(userId: number) {
    return apiRequest(`${API_BASE}/users/${userId}/unfollow`, 'DELETE');
}

// Check if current user is following a user
export async function isFollowingUser(userId: number): Promise<boolean> {
    const data = await fetchJSON(`${API_BASE}/users/${userId}/is-following`);
    return data?.isFollowing || false;
}

// Get list of users that a specific user is following
export async function getFollowingUsers(userId: number): Promise<any[]> {
    const data = await fetchJSON(`${API_BASE}/users/${userId}/following`);
    return data || [];
}

// Update user profile (with File support for images)
export async function updateUserProfileV2(profileData: {
    bio?: string;
    profilePhoto?: string | File;
    bannerImage?: string | File;
    location?: string;
    website?: string;
}) {
    try {
        const data = {
            ...profileData,
            profilePhoto: profileData.profilePhoto instanceof File 
                ? await fileToBase64(profileData.profilePhoto)
                : profileData.profilePhoto,
            bannerImage: profileData.bannerImage instanceof File
                ? await fileToBase64(profileData.bannerImage)
                : profileData.bannerImage,
        };
        
        const res = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return res.ok ? await res.json() : null;
    } catch (err) {
        console.error('Update profile error:', err);
        return null;
    }
}

// Block a user
export async function blockUser(userId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/users/${userId}/block`, 'POST');
}

// Unblock a user
export async function unblockUser(userId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/users/${userId}/block`, 'DELETE');
}

// Get list of blocked users
export async function getBlockedUsers(): Promise<any[]> {
    const data = await fetchJSON(`${API_BASE}/users/blocked-users`);
    return data || [];
}

// Check if current user is blocking another user
export async function isBlockingUser(userId: number): Promise<boolean> {
    const data = await fetchJSON(`${API_BASE}/users/${userId}/is-blocking`);
    return data?.isBlocking || false;
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
export async function createReply(postId: number, textContent: string) {
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}/replies`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ textContent }),
        });
        if (!res.ok) {
            if (res.status === 403) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Vous avez été bloqué par cet utilisateur');
            }
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error('Create reply error:', err);
        throw err;
    }
}

// Get replies for a post
export async function getReplies(postId: number): Promise<any[]> {
    const data = await fetchJSON(`${API_BASE}/posts/${postId}/replies`);
    return data || [];
}

// Delete reply
export async function deleteReply(replyId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/replies/${replyId}`, 'DELETE');
}

// Edit reply
export async function editReply(replyId: number, textContent: string): Promise<any | null> {
    try {
        const res = await fetch(`${API_BASE}/replies/${replyId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ textContent }),
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Edit reply error:', err);
        return null;
    }
}

// Censor a post (admin only)
export async function censorPost(postId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/posts/${postId}/censor`, 'POST');
}

// Uncensor a post (admin only)
export async function uncensorPost(postId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/posts/${postId}/censor`, 'DELETE');
}

// Censor a reply (admin only)
export async function censorReply(replyId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/replies/${replyId}/censor`, 'POST');
}

// Uncensor a reply (admin only)
export async function uncensorReply(replyId: number): Promise<boolean> {
    return apiRequest(`${API_BASE}/replies/${replyId}/censor`, 'DELETE');
}
