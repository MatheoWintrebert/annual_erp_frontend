import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Tag } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useVerify2FAMutation } from "@/services";
import { getAuth } from "@/store/auth/slice";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";

interface CodeFormInputs {
  code: string;
}

export const TwoFactorVerify = () => {
  const navigate = useNavigate();
  const { token } = useSelector(getAuth);
  const [verify2FA, { isLoading }] = useVerify2FAMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const methods = useForm<CodeFormInputs>({ defaultValues: { code: "" } });
  const { handleSubmit, trigger } = methods;

  // No intermediate token means the user skipped step 1.
  useEffect(() => {
    if (!token) {
      void navigate("/signin", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = handleSubmit(async ({ code }: CodeFormInputs) => {
    try {
      setErrorMessage("");
      await verify2FA({ code }).unwrap();
      void navigate("/home");
    } catch {
      setErrorMessage("Invalid code. Please try again.");
    }
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" textAlign="center" fontWeight={700}>
                Two-factor authentication
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}
              >
                Enter the code from your authenticator app.
              </Typography>
            </Box>

            {errorMessage && (
              <Alert
                severity="error"
                onClose={() => {
                  setErrorMessage("");
                }}
              >
                {errorMessage}
              </Alert>
            )}

            <TextField
              type="text"
              label="Authentication code"
              fullWidth
              autoFocus
              error={!!methods.formState.errors.code}
              helperText={methods.formState.errors.code?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tag fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              {...methods.register("code", {
                required: "Code is required",
              })}
              onChange={(e) => {
                void methods.register("code").onChange(e);
                setErrorMessage("");
              }}
              onKeyDown={(e) => {
                void (async () => {
                  if (e.key === "Enter") {
                    const isValid = await trigger();
                    if (isValid) {
                      buttonRef.current?.click();
                    }
                  }
                })();
              }}
            />

            <CustomLoadingButton
              fullWidth
              variant="contained"
              color="secondary"
              onClick={(e) => {
                void onSubmit(e);
              }}
              loading={isLoading}
              ref={buttonRef}
              sx={{ py: 1.5 }}
            >
              Verify
            </CustomLoadingButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
