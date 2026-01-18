import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SellingPage from "./app/pages/SellingPage";
import HomePage from "./app/pages/HomePage";
import SetupPage from "./app/pages/SetupPage";

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<App />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/selling" element={<SellingPage />} />
      <Route path="/setup" element={<SetupPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
