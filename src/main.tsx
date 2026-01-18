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
import Dashboard from './pages/DashBoard.tsx';
import Arena from "./pages/Arena.tsx";
import LeaderBoard from "./pages/LeaderBoard.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Menu/>,
    errorElement: <NotFound/>,
    children: [
      {
        // Diese Gruppe ist nur für eingeloggte User
        element: <PrivateRoute><App/></PrivateRoute>,
        children: [
          {
            index: true, // Das ist "/"
            element: <Dashboard/>,
          },
          {
            path: "arena",
            element: <Arena/>,
          },
          {
            path: "leaderboard",
            element: <LeaderBoard/>,
          },
          {
            path: "user/:userId",
            element: <User/>,
          },
        ],
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

