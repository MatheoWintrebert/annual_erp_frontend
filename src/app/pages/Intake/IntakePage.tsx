import { useCallback, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { useApiError } from "../../hooks/useApiError";
import {
  ProductEntryStep,
  ReviewStep,
  PlacementStep,
  ConflictResolutionStep,
} from "./components";
import {
  useGetProductsForIntake,
  useGetUnitsOfMeasure,
  useRecommendPlacement,
  useRegisterPalette,
} from "./api";
import { buildRegisterPayload, getDefaultIntakeFormData } from "./types";
import type {
  IntakeFormData,
  PlacementResult,
  ProductOption,
  UnitOfMeasure,
} from "./types";

const STEPS = ["Products", "Review", "Place"];

const IntakePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [placementResult, setPlacementResult] =
    useState<PlacementResult | null>(null);
  const navigate = useNavigate();

  const methods = useForm<IntakeFormData>({
    defaultValues: getDefaultIntakeFormData(),
  });

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  // Products for ReviewStep display (default list without search filter)
  const { data: productsData } = useGetProductsForIntake("");
  const products: ProductOption[] = useMemo(
    () => productsData?.products ?? [],
    [productsData?.products]
  );

  // Accumulate products selected via search to ensure ReviewStep can always
  // display them, even if they're outside the default top-20 results
  const selectedProductsRef = useRef(new Map<number, ProductOption>());
  const handleProductSelect = useCallback((product: ProductOption) => {
    selectedProductsRef.current.set(product.id, product);
  }, []);

  const [reviewProducts, setReviewProducts] = useState<ProductOption[]>([]);

  const snapshotReviewProducts = useCallback((): ProductOption[] => {
    const map = new Map(products.map((p) => [p.id, p]));
    for (const [id, product] of selectedProductsRef.current) {
      if (!map.has(id)) {
        map.set(id, product);
      }
    }
    const merged = [...map.values()];
    setReviewProducts(merged);
    return merged;
  }, [products]);

  // H5 fix: Use useWatch for reactive form items instead of getValues() snapshot
  const watchedItems = useWatch({ control: methods.control, name: "items" });

  const { data: unitsData } = useGetUnitsOfMeasure();
  const unitsOfMeasure: UnitOfMeasure[] = unitsData?.unitsOfMeasure ?? [];

  const recommendMutation = useRecommendPlacement();
  const registerMutation = useRegisterPalette();

  const resetForm = useCallback((): void => {
    methods.reset(getDefaultIntakeFormData());
    setActiveStep(0);
    setPlacementResult(null);
  }, [methods]);

  const handleNext = useCallback(async (): Promise<void> => {
    const isValid = await methods.trigger();
    if (isValid) {
      snapshotReviewProducts();
      setActiveStep(1);
    }
  }, [methods, snapshotReviewProducts]);

  const handleBack = useCallback((): void => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSubmit = useCallback((): void => {
    const values = methods.getValues();
    const productIds = values.items
      .map((item) => item.productId)
      .filter((id): id is number => typeof id === "number");

    if (productIds.length === 0) return;

    void (async () => {
      try {
        const result = await recommendMutation.mutateAsync({ productIds });
        setPlacementResult(result);
        setActiveStep(2);
      } catch (err) {
        void handleError(err);
      }
    })();
  }, [methods, recommendMutation, handleError]);

  const handleRegister = useCallback(
    (registerAnother: boolean): void => {
      if (placementResult?.status !== "resolved") return;
      const values = methods.getValues();
      const payload = buildRegisterPayload(
        values,
        placementResult.recommendation
      );

      void (async () => {
        try {
          await registerMutation.mutateAsync(payload);
          showSnackbar("Palette registered successfully", "success");
          if (registerAnother) {
            resetForm();
          } else {
            void navigate("/home");
          }
        } catch (err) {
          void handleError(err);
        }
      })();
    },
    [
      placementResult,
      methods,
      registerMutation,
      showSnackbar,
      handleError,
      resetForm,
      navigate,
    ]
  );

  const handleConflictConfirm = useCallback((): void => {
    void navigate("/home");
  }, [navigate]);

  const handleConflictRegisterAnother = useCallback((): void => {
    resetForm();
  }, [resetForm]);

  const handleBackToProducts = useCallback((): void => {
    setActiveStep(0);
  }, []);

  const isSubmitting =
    recommendMutation.isPending || registerMutation.isPending;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography variant="h4" color="text.primary" mb={3}>
            Palette Intake
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              <ProductEntryStep
                control={methods.control}
                watch={methods.watch}
                unitsOfMeasure={unitsOfMeasure}
                onProductSelect={handleProductSelect}
              />
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    void handleNext();
                  }}
                >
                  Next: Review
                </Button>
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <>
              <ReviewStep
                values={methods.getValues()}
                products={reviewProducts}
                unitsOfMeasure={unitsOfMeasure}
              />
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {recommendMutation.isPending ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Finding placement...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Box>
            </>
          )}

          {activeStep === 2 && placementResult?.status === "resolved" && (
            <PlacementStep
              recommendation={placementResult.recommendation}
              onDone={() => {
                handleRegister(false);
              }}
              onRegisterAnother={() => {
                handleRegister(true);
              }}
              isSubmitting={registerMutation.isPending}
            />
          )}

          {activeStep === 2 && placementResult?.status === "conflict" && (
            <ConflictResolutionStep
              conflictResult={placementResult}
              formItems={watchedItems}
              products={reviewProducts}
              onConfirm={handleConflictConfirm}
              onRegisterAnother={handleConflictRegisterAnother}
              onBack={handleBackToProducts}
            />
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default IntakePage;
