import { useState } from "react";
import type { FC } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, Close, ContentCopy, Email } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "@/services";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface CreateUserFormInputs {
  email: string;
}

export const CreateUserDialog: FC<CreateUserDialogProps> = ({
  open,
  onClose,
}) => {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const methods = useForm<CreateUserFormInputs>({
    defaultValues: { email: "" },
  });
  const { handleSubmit, register, reset, formState } = methods;

  // Clear transient state once the dialog has fully closed, so the next
  // opening starts fresh without triggering a setState-in-effect.
  const handleExited = () => {
    setErrorMessage("");
    setGeneratedPassword("");
    setCopied(false);
    reset();
  };

  const onSubmit = handleSubmit(async ({ email }) => {
    setErrorMessage("");
    try {
      const { password } = await createUser({ email }).unwrap();
      setGeneratedPassword(password);
    } catch {
      setErrorMessage("Could not create the user. The email may already exist.");
    }
  });

  const handleCopy = () => {
    void navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onExited: handleExited } }}
    >
      <DialogTitle>
        Create user
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {generatedPassword ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="success">
              User created. Share this password with them — it will not be shown
              again.
            </Alert>
            <TextField
              label="Generated password"
              fullWidth
              value={generatedPassword}
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={copied ? "Copied!" : "Copy"}>
                        <IconButton onClick={handleCopy} edge="end">
                          {copied ? (
                            <Check fontSize="small" color="success" />
                          ) : (
                            <ContentCopy fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enter the email of the new user. A temporary password will be
              generated.
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              type="email"
              label="Email"
              fullWidth
              autoFocus
              error={!!formState.errors.email}
              helperText={formState.errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email",
                },
              })}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {generatedPassword ? (
          <Button onClick={onClose} variant="contained" color="secondary">
            Done
          </Button>
        ) : (
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <CustomLoadingButton
              variant="contained"
              color="secondary"
              onClick={(e) => {
                void onSubmit(e);
              }}
              loading={isLoading}
            >
              Create
            </CustomLoadingButton>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};
