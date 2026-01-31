import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SellingPage from "./app/pages/Selling/SellingPage";
import HomePage from "./app/pages/Home/HomePage";
import CustomPage from "./app/pages/Custom/CustomPage";
import PalettierPage from "./app/pages/Palettier/PalettierPage";

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<App />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/selling" element={<SellingPage />} />
      <Route path="/custom" element={<CustomPage />} />
      <Route path="/palettier" element={<PalettierPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
