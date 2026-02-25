import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
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
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CompanySettingsProvider } from "./app/context/CompanySettingsContext";
import { queryClient } from "./queryClient";
import { AuthProvider } from "./app/context/AuthContext";
import ErrorBoundary from "./app/components/ui/ErrorBoundary";
import SnackbarProvider from "./app/components/ui/SnackbarProvider";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { store } from "./store/store";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CompanySettingsProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SnackbarProvider>
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
              </SnackbarProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </CompanySettingsProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
