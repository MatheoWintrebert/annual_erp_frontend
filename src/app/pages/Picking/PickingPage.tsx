import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import StepWizard from "../../components/wizard/StepWizard";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { useApiError } from "../../hooks/useApiError";
import { ProductSelectStep, ReviewListStep, PickRouteStep } from "./components";
import {
  useGetAvailableStock,
  useCreatePickingList,
  useGeneratePickRoute,
  useCompletePickingList,
  useCancelPickingList,
} from "./api";
import {
  allItemsActioned,
  buildCompletionPayload,
  buildCreatePickingListPayload,
  getDefaultPickingFormData,
  toExecutionItems,
} from "./types";
import type {
  AvailableStockItem,
  PickExecutionItem,
  PickingFormData,
} from "./types";

const PickingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [executionItems, setExecutionItems] = useState<PickExecutionItem[]>([]);
  const [pickingListId, setPickingListId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const methods = useForm<PickingFormData>({
    defaultValues: getDefaultPickingFormData(),
  });

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const watchedItems = useWatch({ control: methods.control, name: "items" });

  const productIds = useMemo(
    () =>
      watchedItems
        .filter(
          (i): i is typeof i & { product: NonNullable<typeof i.product> } =>
            i.product !== null
        )
        .map((i) => i.product.id),
    [watchedItems]
  );

  const { data: stockData } = useGetAvailableStock(productIds);

  const stockMap = useMemo(() => {
    const map = new Map<number, AvailableStockItem>();
    if (stockData) {
      for (const item of stockData) {
        map.set(item.productId, item);
      }
    }
    return map;
  }, [stockData]);

  const createMutation = useCreatePickingList();
  const generateRouteMutation = useGeneratePickRoute();
  const completeMutation = useCompletePickingList();
  const cancelMutation = useCancelPickingList();

  const handleStartPicking = useCallback(async (): Promise<void> => {
    const values = methods.getValues();
    const payload = buildCreatePickingListPayload(values);

    if (payload.items.length === 0) return;

    try {
      const pickingList = await createMutation.mutateAsync(payload);
      const route = await generateRouteMutation.mutateAsync(pickingList.id);
      setExecutionItems(toExecutionItems(route));
      setPickingListId(pickingList.id);
      setActiveStep(2);
    } catch (err) {
      void handleError(err);
    }
  }, [methods, createMutation, generateRouteMutation, handleError]);

  const handleNext = useCallback(async (): Promise<void> => {
    if (activeStep === 0) {
      const isValid = await methods.trigger();
      if (!isValid) return;

      const values = methods.getValues();
      const hasProducts = values.items.some((item) => item.product !== null);
      if (!hasProducts) {
        showSnackbar("Select at least one product before proceeding", "error");
        return;
      }

      setActiveStep(1);
    } else if (activeStep === 1) {
      await handleStartPicking();
    }
  }, [activeStep, methods, handleStartPicking, showSnackbar]);

  const handleBack = useCallback((): void => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const handleTogglePicked = useCallback((index: number): void => {
    setExecutionItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              status: item.status === "picked" ? "pending" : "picked",
            }
          : item
      )
    );
  }, []);

  const handleSkip = useCallback((index: number): void => {
    setExecutionItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, status: "skipped" as const, actualQuantity: 0 }
          : item
      )
    );
  }, []);

  const handleQuantityChange = useCallback(
    (index: number, quantity: number): void => {
      setExecutionItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, actualQuantity: quantity } : item
        )
      );
    },
    []
  );

  const resetWizard = useCallback((): void => {
    methods.reset(getDefaultPickingFormData());
    setExecutionItems([]);
    setPickingListId(null);
    setActiveStep(0);
    setShowCancelDialog(false);
  }, [methods]);

  const handleValidateComplete = useCallback(async (): Promise<void> => {
    if (pickingListId === null) return;

    try {
      const payload = buildCompletionPayload(executionItems);
      const result = await completeMutation.mutateAsync({
        pickingListId,
        payload,
      });

      if (result.discrepancies.length > 0) {
        showSnackbar(
          `Picking completed with ${String(result.discrepancies.length)} discrepancies. ${String(result.totalItemsPicked)} items deducted.`,
          "success"
        );
      } else {
        showSnackbar(
          `Picking completed! ${String(result.totalItemsPicked)} items deducted from stock.`,
          "success"
        );
      }
      resetWizard();
    } catch (err) {
      void handleError(err);
    }
  }, [
    pickingListId,
    executionItems,
    completeMutation,
    showSnackbar,
    handleError,
    resetWizard,
  ]);

  const handleCancelList = useCallback((): void => {
    setShowCancelDialog(true);
  }, []);

  const handleConfirmCancel = useCallback(async (): Promise<void> => {
    if (pickingListId === null) return;

    try {
      await cancelMutation.mutateAsync(pickingListId);
      showSnackbar("Picking list cancelled — no stock deducted", "success");
      resetWizard();
    } catch (err) {
      void handleError(err);
    }
  }, [pickingListId, cancelMutation, showSnackbar, handleError, resetWizard]);

  const allActioned =
    executionItems.length > 0 && allItemsActioned(executionItems);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Typography variant="h4" color="text.primary" mb={3}>
            Create Picking List
          </Typography>

          <StepWizard
            steps={[
              {
                label: "Select Products",
                content: (
                  <ProductSelectStep
                    control={methods.control}
                    stockMap={stockMap}
                  />
                ),
              },
              {
                label: "Review",
                content: (
                  <ReviewListStep items={watchedItems} stockMap={stockMap} />
                ),
              },
              {
                label: "Pick Route",
                content: (
                  <PickRouteStep
                    executionItems={executionItems}
                    onTogglePicked={handleTogglePicked}
                    onSkip={handleSkip}
                    onQuantityChange={handleQuantityChange}
                  />
                ),
              },
            ]}
            activeStep={activeStep}
            onNext={() => {
              void handleNext();
            }}
            onBack={handleBack}
            onConfirm={() => {
              void handleValidateComplete();
            }}
            isSubmitting={
              createMutation.isPending ||
              generateRouteMutation.isPending ||
              completeMutation.isPending
            }
            confirmLabel="Validate Complete"
            submittingLabel="Validating..."
            disableConfirm={!allActioned}
            disableConfirmReason="Mark all items as picked or skipped before validating"
          />

          {activeStep === 2 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelList}
                disabled={cancelMutation.isPending}
              >
                Cancel List
              </Button>
            </Box>
          )}

          <Dialog
            open={showCancelDialog}
            onClose={() => {
              setShowCancelDialog(false);
            }}
          >
            <DialogTitle>Cancel Picking List?</DialogTitle>
            <DialogContent>
              <Typography>
                Cancel this picking list? No stock will be deducted.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setShowCancelDialog(false);
                }}
                color="secondary"
              >
                Keep Picking
              </Button>
              <Button
                onClick={() => {
                  void handleConfirmCancel();
                }}
                color="error"
                disabled={cancelMutation.isPending}
              >
                Cancel List
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default PickingPage;
