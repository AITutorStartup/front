import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import authStyles from "@/pages/auth/Auth.module.css";

interface ProtectedRouteProps {
  children: ReactElement;
}

import { DISABLE_ROUTE_PROTECTION } from "@/config/dev";

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isChecking } = useAuth();
  const location = useLocation();

  // В режиме без защиты просто возвращаем children
  if (DISABLE_ROUTE_PROTECTION) {
    return children;
  }

  if (isChecking) {
    return (
      <div className={authStyles.authContainer}>
        <div className={authStyles.formWrapper}>
          <p>Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }

  return children;
};

export default ProtectedRoute;

