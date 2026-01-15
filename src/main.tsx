import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import NotFound from "./pages/NotFound.tsx";
import Menu from "./layout/Menu.tsx";
import User from "./pages/User.tsx";
import ActivationPage from "./pages/ActivationPage.tsx";
import PrivateRoute from './pages/PrivateRoute.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Menu/>,
    errorElement: <NotFound/>,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <App/>
          </PrivateRoute>
        ),
      },
      {
        path: "user/:userId",
        element: (
          <PrivateRoute>
            <User/>
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/register",
    element: <RegisterPage/>,
  },
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "/logout",
    element: <LoginPage/>,
  },
  {
    path: "/activate/",
    element: <ActivationPage/>,
  },
  {
    path: "/activate/:token",
    element: <ActivationPage/>,
  },
]);


const container = document.getElementById('root');

createRoot(container!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
);

