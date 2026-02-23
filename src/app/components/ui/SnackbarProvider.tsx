import {
  createContext,
  use,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export const useSnackbar = (): SnackbarContextValue => {
  const context = use(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarMessage>({
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setSnackbar({ message, severity });
      setOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SnackbarContext value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={
          snackbar.severity === "error"
            ? 8000
            : snackbar.severity === "warning"
              ? 6000
              : 5000
        }
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext>
  );
};

export default SnackbarProvider;
