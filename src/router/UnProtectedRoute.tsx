import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { To } from "react-router-dom";

import { getAuth } from "@/store/auth";

import { ROUTES } from "@/router";
import type { Route } from "@/router";

interface UnProtectedRouteProps {
  redirectPath?: Route;
}

export const UnProtectedRoute = (props: UnProtectedRouteProps) => {
  const { redirectPath = ROUTES.HOME } = props;
  const { isAuthenticated } = useSelector(getAuth);
  const location = useLocation();

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const redirectTo = `${redirectPath}${location.search ? `?${searchParams.toString()}` : ""}`;

    return <Navigate to={redirectTo as To} replace />;
  }

  return <Outlet />;
};
