import { useState } from "react";
import type { FC } from "react";
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
import { Lock } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useEditPasswordMutation } from "@/services";
import { getAuth as getAccount } from "@/store/account/slice";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";

interface PasswordFormInputs {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: FC = () => {
  const { user } = useSelector(getAccount);
  const [editPassword, { isLoading }] = useEditPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const methods = useForm<PasswordFormInputs>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const { handleSubmit, register, getValues, reset, formState } = methods;

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await editPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      setSuccessMessage("Your password has been updated.");
      reset();
    } catch {
      setErrorMessage(
        "Could not update the password. Check your current password."
      );
    }
  });

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1} py={4}>
        <Container maxWidth="sm">
          <Typography variant="h3" fontWeight={600} gutterBottom>
            Profile
          </Typography>
          {user?.email && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
          )}

          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 3,
              borderRadius: 2,
              border: 1,
              borderColor: "rgba(255, 255, 255, 0.06)",
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Change password
            </Typography>

            <Stack spacing={3}>
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
              {successMessage && (
                <Alert
                  severity="success"
                  onClose={() => {
                    setSuccessMessage("");
                  }}
                >
                  {successMessage}
                </Alert>
              )}

              <TextField
                type="password"
                label="Current password"
                fullWidth
                error={!!formState.errors.oldPassword}
                helperText={formState.errors.oldPassword?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register("oldPassword", {
                  required: "Current password is required",
                })}
              />

              <TextField
                type="password"
                label="New password"
                fullWidth
                error={!!formState.errors.newPassword}
                helperText={formState.errors.newPassword?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />

              <TextField
                type="password"
                label="Confirm new password"
                fullWidth
                error={!!formState.errors.confirmPassword}
                helperText={formState.errors.confirmPassword?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register("confirmPassword", {
                  required: "Please confirm the new password",
                  validate: (value) =>
                    value === getValues("newPassword") ||
                    "Passwords do not match",
                })}
              />

              <CustomLoadingButton
                variant="contained"
                color="secondary"
                onClick={(e) => {
                  void onSubmit(e);
                }}
                loading={isLoading}
                sx={{ py: 1.5, alignSelf: "flex-start", px: 4 }}
              >
                Update password
              </CustomLoadingButton>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default ProfilePage;
