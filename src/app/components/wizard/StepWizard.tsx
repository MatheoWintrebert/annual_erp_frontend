import {
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
} from "@mui/material";
import type { FC } from "react";
import type { StepWizardProps } from "./types";

const StepWizard: FC<StepWizardProps> = ({
  steps,
  activeStep,
  onNext,
  onBack,
  onConfirm,
  isSubmitting = false,
  confirmLabel = "Confirm",
  submittingLabel = "Submitting...",
  disableConfirm = false,
  disableConfirmReason,
}) => {
  if (steps.length === 0) return null;

  const clampedStep = Math.min(activeStep, steps.length - 1);
  const isLastStep = clampedStep === steps.length - 1;

  const confirmButton = (
    <Button
      onClick={onConfirm}
      variant="contained"
      color="secondary"
      disabled={isSubmitting || disableConfirm}
    >
      {isSubmitting ? (
        <>
          <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          {submittingLabel}
        </>
      ) : (
        confirmLabel
      )}
    </Button>
  );

  return (
    <Box>
      <Stepper activeStep={clampedStep} sx={{ mb: 3 }}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>{steps[clampedStep].content}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          onClick={onBack}
          disabled={clampedStep === 0 || isSubmitting}
          variant="outlined"
          color="secondary"
        >
          Back
        </Button>

        {isLastStep ? (
          disableConfirm ? (
            <Tooltip title={disableConfirmReason} arrow>
              <span>{confirmButton}</span>
            </Tooltip>
          ) : (
            confirmButton
          )
        ) : (
          <Button onClick={onNext} variant="contained" color="secondary">
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default StepWizard;
