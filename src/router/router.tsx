import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import type { ComponentType } from "react";

import { ROUTES } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { UnProtectedRoute } from "./UnProtectedRoute";

export const routesConfig = createRoutesFromElements(
  <Route path="/">
    {/* Auth Protected Stuff */}
    <Route element={<ProtectedRoute />}>
      {/* <Route lazy={() => import('@/layouts/Layout')}> */}
      {/* Home */}
      {/* <Route index lazy={() => import('@/pages/Home')} /> */}

      {/* Account */}
      {/* <Route path={ROUTES.ACCOUNT} lazy={() => import('@/pages/Account')} /> */}

      {/* 404 */}
      {/* <Route path="*" lazy={() => import('@/pages/NotFound')} /> */}
      {/* </Route> */}
    </Route>

    {/* Auth Flow / UnProtected */}
    <Route element={<UnProtectedRoute />}>
      {/* <Route lazy={() => import('@/layouts/LayoutAuth')}> */}
      {/* <Route path={ROUTES.AUTH} lazy={() => import('@/pages/Auth')} /> */}
      <Route
        path={ROUTES.SIGN_IN}
        lazy={async (): Promise<{ Component: ComponentType }> => {
          const module = await import("@/pages/SignIn");
          return { Component: module.default as ComponentType };
        }}
      />
      {/* <Route path={ROUTES.SIGN_UP} lazy={() => import('@/pages/SignUp')} /> */}
      {/* <Route path={ROUTES.RESET_PASSWORD_CONFIRMATION} lazy={() => import('@/pages/ResetPassword/Confirmation')} />
				<Route path={ROUTES.RESET_PASSWORD} lazy={() => import('@/pages/ResetPassword')} /> */}
      {/* </Route> */}
    </Route>
  </Route>
);

export const router = createBrowserRouter(routesConfig);
