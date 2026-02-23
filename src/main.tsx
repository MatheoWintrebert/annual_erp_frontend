import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import "./index.css";
import Router from "./Router";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { store } from './store/store';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
    </Provider>
  </StrictMode>
);
