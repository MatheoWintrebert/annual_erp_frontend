import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { getAuth } from "@/store/auth/slice";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useSelector(getAuth);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
