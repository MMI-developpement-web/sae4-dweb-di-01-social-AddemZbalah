// API utility for calling backend endpoints
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
  avatar?: string;
  createdAt?: string;
  postsCount?: number;
}

export interface Post {
  id: number;
  content: string;
  time?: string;
  createdAt: string;
  user: {
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
export async function getPosts(page: number = 1): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/posts?page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Fetch posts failed');
    return await res.json();
  } catch (err) {
    console.error('Get posts error:', err);
    return [];
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
