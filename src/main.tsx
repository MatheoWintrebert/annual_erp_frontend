import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Router";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CompanySettingsProvider } from "./app/context/CompanySettingsContext";
import { queryClient } from "./queryClient";
import { AuthProvider } from "./app/context/AuthContext";
import ErrorBoundary from "./app/components/ui/ErrorBoundary";
import SnackbarProvider from "./app/components/ui/SnackbarProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <CompanySettingsProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SnackbarProvider>
            <ErrorBoundary>
              <CssBaseline />
              <Router />
            </ErrorBoundary>
          </SnackbarProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </CompanySettingsProvider>
  </StrictMode>
);
