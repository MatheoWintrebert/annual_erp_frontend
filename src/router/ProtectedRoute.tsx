import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { To } from "react-router-dom";

import { getAuth } from "@/store/auth";

import { ROUTES } from "@/router";
import type { Route } from "@/router";

interface ProtectedRouteProps {
  redirectPath?: Route;
}

export const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { redirectPath = ROUTES.SIGN_IN } = props;
  const { isAuthenticated } = useSelector(getAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    const fromPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("from", fromPath);
    const redirectTo = `${redirectPath}?${searchParams.toString()}`;
    return <Navigate to={redirectTo as To} replace />;
  }

  return <Outlet />;
};
