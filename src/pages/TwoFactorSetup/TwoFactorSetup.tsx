import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, ContentCopy, Tag } from "@mui/icons-material";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useGenerate2FAMutation, useVerify2FAMutation } from "@/services";
import { getAuth } from "@/store/auth/slice";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";

interface CodeFormInputs {
  code: string;
}

export const TwoFactorSetup = () => {
  const navigate = useNavigate();
  const { token } = useSelector(getAuth);
  const [generate2FA, { data, isLoading: isGenerating, isError: isGenError }] =
    useGenerate2FAMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const generatedRef = useRef(false);

  const methods = useForm<CodeFormInputs>({ defaultValues: { code: "" } });
  const { handleSubmit } = methods;

  // No intermediate token means the user skipped step 1.
  useEffect(() => {
    if (!token) {
      void navigate("/signin", { replace: true });
    }
  }, [token, navigate]);

  // Generate a fresh secret + QR once on mount.
  useEffect(() => {
    if (token && !generatedRef.current) {
      generatedRef.current = true;
      void generate2FA();
    }
  }, [token, generate2FA]);

  const handleCopy = () => {
    if (!data?.secret) return;
    void navigator.clipboard.writeText(data.secret).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

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
                Set up 2FA
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}
              >
                Scan the QR code with your authenticator app, then enter the
                generated code below.
              </Typography>
            </Box>

            {isGenError && (
              <Alert severity="error">
                Could not generate the 2FA secret. Please try again later.
              </Alert>
            )}

            {isGenerating && (
              <Typography variant="body2" textAlign="center">
                Generating secret…
              </Typography>
            )}

            {data?.qrCodeUrl && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <QRCode value={data.qrCodeUrl} size={180} />
                </Box>

                <TextField
                  label="Secret key"
                  fullWidth
                  value={data.secret}
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
              </>
            )}

            <Divider />

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
              loading={isVerifying}
              sx={{ py: 1.5 }}
            >
              Verify & continue
            </CustomLoadingButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
