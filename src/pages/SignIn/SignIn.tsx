import { useLoginMutation } from "@/services";
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Email, Lock, Tag } from "@mui/icons-material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { storage } from "@/utils";
import { useForm } from "react-hook-form";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";
import { setAuthenticatedUser } from "@/store/auth/slice";

interface SignInFormInputs {
  email: string;
  password: string;
  code: string;
}

export const SignIn = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const methods = useForm<SignInFormInputs>({
    defaultValues: {
      code: storage.getItem("email") ?? "",
    },
  });
  const { handleSubmit, trigger } = methods;

  const buttonRef = useRef<HTMLButtonElement>(null);

  const onSubmit = handleSubmit(
    async ({ email, password, code }: SignInFormInputs) => {
      try {
        setErrorMessage("");
        const result = await login({ email, password, code }).unwrap();
        dispatch(setAuthenticatedUser(result));
        void navigate("/home");
      } catch {
        setErrorMessage("Login failed. Please check your credentials.");
      }
    }
  );

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
            <Typography
              variant="h4"
              textAlign="center"
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Sign In
            </Typography>

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
              type="email"
              label="Email"
              fullWidth
              error={!!methods.formState.errors.email}
              helperText={methods.formState.errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              {...methods.register("email", {
                required: "Email is required",
              })}
            />

            <TextField
              type="password"
              label="Password"
              fullWidth
              error={!!methods.formState.errors.password}
              helperText={methods.formState.errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              {...(() => {
                const { onChange: onPasswordChange, ...passwordReg } =
                  methods.register("password", {
                    required: "Password is required",
                  });
                return {
                  ...passwordReg,
                  onChange: (e) => {
                    void onPasswordChange(e);
                    setErrorMessage("");
                  },
                };
              })()}
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

            <TextField
              type="text"
              label="Code"
              fullWidth
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
              sx={{ py: 1.5, mt: 1 }}
            >
              Login
            </CustomLoadingButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
