import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoggedIn from './pages/LoggedIn.tsx';
import NotFound from "./pages/NotFound.tsx";
import Menu from "./layout/Menu.tsx";
import User from "./pages/User.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoggedIn><App /></LoggedIn>,
    errorElement: <NotFound />
  },
  {
    path: "login",
    element: <h1>Login</h1>,
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
    ],
  },
]);

const container = document.getElementById('root')

createRoot(container!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

