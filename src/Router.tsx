import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./app/pages/Home/HomePage";
import CustomPage from "./app/pages/Custom/CustomPage";
import PalettierPage from "./app/pages/Palettier/PalettierPage";
import ProductPage from "./app/pages/Product/ProductPage";
import RulesPage from "./app/pages/Rules/RulesPage";
import IntakePage from "./app/pages/Intake/IntakePage";
import PickingPage from "./app/pages/Picking/PickingPage";
import StockPage from "./app/pages/Stock/StockPage";
import App from "./App";
import { SignIn } from "./pages/SignIn";

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/app" element={<App />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/intake" element={<IntakePage />} />
      <Route path="/pick" element={<PickingPage />} />
      <Route path="/custom" element={<CustomPage />} />
      <Route path="/palettier" element={<PalettierPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="*" element={<SignIn />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
