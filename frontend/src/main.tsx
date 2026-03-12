import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import './index.css';

import Connexion from './routes/connexion';
import Inscription from './routes/inscription';
import Addposts from './routes/Addposts';
import Fil from './routes/fil';
import Home from './routes/home';
import Dashboard from './routes/dashboard';
import Utilisateurs from './routes/utilisateurs';
import Settings from './routes/settings';
import Root from './routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Navigate to="/fil" replace />,
      },
      {
        path: 'connexion',
        element: <Connexion />,
      },
      {
        path: 'inscription',
        element: <Inscription />,
      },
      {
        path: 'fil',
        element: <Fil />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'utilisateurs',
        element: <Utilisateurs />,
      },
      {
        path: 'add-post',
        element: <Addposts />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
