import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import NotFound from "./pages/NotFound.tsx";
import Menu from "./layout/Menu.tsx";
import User from "./pages/User.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />
  },
    {
    path: "/",
    element: <Menu />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "user/:userId",
        element: <User />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
]);

const container = document.getElementById('root')

createRoot(container!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

