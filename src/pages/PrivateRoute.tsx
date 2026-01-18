import {type JSX, useEffect, useState} from "react";
import { Navigate } from "react-router-dom";
import {apiRequest} from "../utils/apiClient.ts";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      try {
        const res = await apiRequest("/api/protected-check");

        if (res.ok) {
          setAuthorized(true);
        } else {
          localStorage.clear();
          setAuthorized(false);
        }
      } catch (err) {
        console.error(err);
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    checkToken();
  }, []);

  if (checking) return <div>Loading...</div>; // or spinner

  return authorized ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
