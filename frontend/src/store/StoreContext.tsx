import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppState, StoreContextType, User, Post } from './types';
import { getCurrentUser } from '../lib/api';

const StoreContext = createContext<StoreContextType | null>(null);

const initialState: AppState = {
  currentUser: null,
  posts: [],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialState.currentUser);
  const [posts, setPosts] = useState<Post[]>(initialState.posts);

  // Charger l'utilisateur au démarrage s'il y a un token
  useEffect(() => {
    if (localStorage.getItem('token')) {
      getCurrentUser()
        .then(user => setCurrentUser(user))
        .catch(err => console.error("Erreur de chargement de l'utilisateur", err));
    }
  }, []);

  const login = (user: User): void => {
    setCurrentUser(user);
  };

  const logout = (): void => {
    setCurrentUser(null);
  };

  const addPost = (post: Post): void => {
    setPosts((prev) => [post, ...prev]);
  };

  const updatePost = (updatedPost: Post): void => {
    setPosts((prev) => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };
  
  const removePost = (postId: number): void => {
    setPosts((prev) => prev.filter(p => p.id !== postId));
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        posts,
        login,
        logout,
        setPosts,
        addPost,
        updatePost,
        removePost,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore doit être utilisé à l'intérieur d'un <StoreProvider>");
  }
  return context;
};
