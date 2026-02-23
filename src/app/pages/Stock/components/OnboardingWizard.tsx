import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import type { FC } from "react";
import StepWizard from "../../../components/wizard/StepWizard";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useApiError } from "../../../hooks/useApiError";
import { useRegisterOnboardingPalette } from "../api";
import type { OnboardingProductEntry } from "../types";
import OnboardingProductStep from "./OnboardingProductStep";
import OnboardingReviewStep from "./OnboardingReviewStep";
import OnboardingPlacementStep from "./OnboardingPlacementStep";

interface OnboardingWizardProps {
  onClose: () => void;
}

const OnboardingWizard: FC<OnboardingWizardProps> = ({ onClose }) => {
  const [products, setProducts] = useState<OnboardingProductEntry[]>([]);
  const [placement, setPlacement] = useState({
    palettierId: null as number | null,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [nextAttempted, setNextAttempted] = useState(false);

  const registerPalette = useRegisterOnboardingPalette();
  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const handleNext = () => {
    if (activeStep === 0 && products.length === 0) {
      setNextAttempted(true);
      return;
    }
    setNextAttempted(false);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const canConfirm = placement.palettierId !== null;

  const handleConfirm = async () => {
    if (placement.palettierId === null) return;

    try {
      await registerPalette.mutateAsync({
        palettierId: placement.palettierId,
        positionX: placement.positionX,
        positionY: placement.positionY,
        positionZ: placement.positionZ,
        items: products.map((p) => ({
          productId: p.productId,
          lotReference: p.manualLot ? p.lotReference : undefined,
          expiryDate: p.expiryDate ?? undefined,
          quantity: p.quantity,
        })),
      });
      showSnackbar("Palette onboarded successfully", "success");
      setIsComplete(true);
    } catch (error) {
      await handleError(error);
    }
  };

  const handleAddAnother = () => {
    setProducts([]);
    setPlacement({
      palettierId: null,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    });
    setActiveStep(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={6}
        gap={3}
      >
        <Typography variant="h5" color="text.primary">
          Palette onboarded successfully
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The palette has been registered with {products.length} product
          {products.length !== 1 ? "s" : ""}.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddAnother}
          >
            Add Another
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Back to Stock
          </Button>
        </Box>
      </Box>
    );
  }

  const steps = [
    {
      label: "Products",
      content: (
        <OnboardingProductStep
          products={products}
          onProductsChange={setProducts}
          showEmptyError={nextAttempted}
        />
      ),
    },
    {
      label: "Review",
      content: <OnboardingReviewStep products={products} />,
    },
    {
      label: "Place",
      content: (
        <OnboardingPlacementStep
          products={products}
          palettierId={placement.palettierId}
          positionX={placement.positionX}
          positionY={placement.positionY}
          positionZ={placement.positionZ}
          onPlacementChange={setPlacement}
        />
      ),
    },
  ];

  return (
    <StepWizard
      steps={steps}
      activeStep={activeStep}
      onNext={handleNext}
      onBack={handleBack}
      onConfirm={() => void handleConfirm()}
      isSubmitting={registerPalette.isPending}
      confirmLabel="Register Palette"
      submittingLabel="Registering..."
      {...(!canConfirm
        ? { disableConfirm: true, disableConfirmReason: "Please select a palettier before registering" }
        : {})}
    />
  );
};

export default OnboardingWizard;
