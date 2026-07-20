import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./app/pages/Home/HomePage";
import CustomPage from "./app/pages/Custom/CustomPage";
import PalettierPage from "./app/pages/Palettier/PalettierPage";
import Palettier3DPage from "./app/pages/Palettier/Palettier3DPage";
import ProductPage from "./app/pages/Product/ProductPage";
import RulesPage from "./app/pages/Rules/RulesPage";
import IntakePage from "./app/pages/Intake/IntakePage";
import PickingPage from "./app/pages/Picking/PickingPage";
import StockPage from "./app/pages/Stock/StockPage";
import ResolveViolationPage from "./app/pages/ResolveViolation";
import ProfilePage from "./app/pages/Profile/ProfilePage";
import UsersPage from "./app/pages/Users/UsersPage";
import App from "./App";
import { SignIn } from "./pages/SignIn";
import { TwoFactorSetup } from "./pages/TwoFactorSetup";
import { TwoFactorVerify } from "./pages/TwoFactorVerify";
import ProtectedRoute from "./app/components/auth/ProtectedRoute";

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/2fa-setup" element={<TwoFactorSetup />} />
      <Route path="/2fa-verify" element={<TwoFactorVerify />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<App />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/pick" element={<PickingPage />} />
        <Route path="/custom" element={<CustomPage />} />
        <Route path="/palettier" element={<PalettierPage />} />
        <Route path="/palettier/3d" element={<Palettier3DPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route
          path="/resolve-violation/:paletteId"
          element={<ResolveViolationPage />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Router;
