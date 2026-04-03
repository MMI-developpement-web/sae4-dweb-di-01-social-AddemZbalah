import React from 'react';
import type { User as ApiUser } from '../lib/api';

export type User = ApiUser;

export interface Post {
  id: number;
  content: string;
  author: any;
  authorId?: number;
  likes?: number[];
  createdAt?: string;
  mediaUrl?: string | null;
  media_url?: string | null;
  status?: string;
  replies?: number;
  isCensored?: boolean;
  isAuthorBlocked?: boolean;
}

export interface AppState {
  currentUser: User | null;
  posts: Post[];
}

export interface StoreActions {
  login: (user: User) => void;
  logout: () => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  addPost: (post: Post) => void;
  updatePost: (updatedPost: Post) => void;
  removePost: (postId: number) => void;
}

export type StoreContextType = AppState & StoreActions;
