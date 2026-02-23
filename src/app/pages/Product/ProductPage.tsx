import {
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { FC } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { StepWizard } from "../../components/wizard";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { useApiError } from "../../hooks/useApiError";
import ViolationAlertDialog from "../../components/ViolationAlertDialog";
import type { RuleViolation } from "../../components/ViolationAlertDialog";
import { ProductList, ProductFormStep, ProductReviewStep } from "./components";
import {
  useGetProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useGetProductPaletteCount,
  useGetCategories,
  useGetUnitsOfMeasure,
  useGetRulesForSelect,
  useCreateCategory,
  useCreateUnitOfMeasure,
} from "./api";
import type {
  ProductResponse,
  ProductWizardFormData,
  CreateProductPayload,
  Category,
  UnitOfMeasure,
} from "./types";
import { getDefaultProductFormData, prefillFromExisting } from "./types";

const buildPayload = (data: ProductWizardFormData): CreateProductPayload => ({
  reference: data.reference,
  name: data.name,
  unitOfMeasureId: data.unitOfMeasureId as number,
  categoryId: data.categoryId === "" ? null : data.categoryId,
  minimumStock: data.minimumStock === "" ? null : data.minimumStock,
  expiryAlertThreshold:
    data.expiryAlertThreshold === "" ? null : data.expiryAlertThreshold,
  ruleIds: data.ruleIds,
});

const ProductPage: FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null
  );
  const [activeStep, setActiveStep] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(
    null
  );
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProducts();

  const products = productsData?.products ?? [];

  const { data: categoriesData } = useGetCategories();
  const categories = categoriesData?.categories ?? [];

  const { data: unitsData } = useGetUnitsOfMeasure();
  const unitsOfMeasure = unitsData?.unitsOfMeasure ?? [];

  const { data: rulesData } = useGetRulesForSelect();
  const rules = rulesData?.rules ?? [];

  const { data: paletteCountData, isLoading: isLoadingPaletteCount } =
    useGetProductPaletteCount(deleteTarget?.id ?? 0);
  const activePaletteCount = paletteCountData?.count ?? 0;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const createUnitMutation = useCreateUnitOfMeasure();

  const methods = useForm<ProductWizardFormData>({
    defaultValues: getDefaultProductFormData(),
  });

  const handleCategoryCreated = useCallback(
    (category: Category): void => {
      methods.setValue("categoryId", category.id);
      showSnackbar(`Category "${category.name}" created`, "success");
    },
    [methods, showSnackbar]
  );

  const handleUnitCreated = useCallback(
    (unit: UnitOfMeasure): void => {
      methods.setValue("unitOfMeasureId", unit.id);
      showSnackbar(
        `Unit "${unit.name} (${unit.abbreviation})" created`,
        "success"
      );
    },
    [methods, showSnackbar]
  );

  const openCreateWizard = useCallback((): void => {
    setEditingProduct(null);
    methods.reset(getDefaultProductFormData());
    setActiveStep(0);
    setWizardOpen(true);
  }, [methods]);

  const openEditWizard = useCallback(
    (product: ProductResponse): void => {
      setEditingProduct(product);
      methods.reset(prefillFromExisting(product));
      setActiveStep(0);
      setWizardOpen(true);
    },
    [methods]
  );

  const closeWizard = useCallback((): void => {
    setWizardOpen(false);
    setEditingProduct(null);
    setActiveStep(0);
  }, []);

  const handleNext = useCallback((): void => {
    void methods.trigger().then((isValid) => {
      if (isValid) {
        setActiveStep(1);
      }
    });
  }, [methods]);

  const handleBack = useCallback((): void => {
    setActiveStep(0);
  }, []);

  const closeViolationDialog = useCallback((): void => {
    setViolationDialogOpen(false);
    setViolations([]);
  }, []);

  const handleConfirm = useCallback((): void => {
    void methods.handleSubmit(async (data: ProductWizardFormData) => {
      try {
        if (editingProduct) {
          const result = await updateMutation.mutateAsync({
            id: editingProduct.id,
            ...buildPayload(data),
          });
          closeWizard();
          if (result.violations.length > 0) {
            setViolations(result.violations);
            setViolationDialogOpen(true);
          } else {
            showSnackbar("Product updated successfully", "success");
          }
        } else {
          await createMutation.mutateAsync(buildPayload(data));
          showSnackbar("Product created successfully", "success");
          closeWizard();
        }
      } catch (err) {
        void handleError(err);
      }
    })();
  }, [
    methods,
    editingProduct,
    createMutation,
    updateMutation,
    closeWizard,
    showSnackbar,
    handleError,
  ]);

  const openDeleteDialog = useCallback((product: ProductResponse): void => {
    setDeleteTarget(product);
  }, []);

  const closeDeleteDialog = useCallback((): void => {
    setDeleteTarget(null);
  }, []);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSnackbar("Product deleted successfully", "success");
      closeDeleteDialog();
    } catch (err) {
      void handleError(err);
    }
  }, [
    deleteTarget,
    deleteMutation,
    showSnackbar,
    closeDeleteDialog,
    handleError,
  ]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const wizardSteps = [
    {
      label: "Details",
      content: (
        <ProductFormStep
          methods={methods}
          categories={categories}
          unitsOfMeasure={unitsOfMeasure}
          rules={rules}
          createCategoryMutation={createCategoryMutation}
          createUnitMutation={createUnitMutation}
          onCategoryCreated={handleCategoryCreated}
          onUnitCreated={handleUnitCreated}
        />
      ),
    },
    {
      label: "Review",
      content: (
        <ProductReviewStep
          values={methods.getValues()}
          categories={categories}
          unitsOfMeasure={unitsOfMeasure}
          rules={rules}
        />
      ),
    },
  ];

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            color="text.primary"
            gutterBottom
            fontWeight={600}
            mt={4}
          >
            Product Management
          </Typography>

          <ProductList
            products={products}
            categories={categories}
            unitsOfMeasure={unitsOfMeasure}
            isLoading={isLoadingProducts}
            error={productsError}
            onCreateNew={openCreateWizard}
            onEdit={openEditWizard}
            onDelete={openDeleteDialog}
          />
        </Container>
      </Box>
      <Footer />

      <Dialog open={wizardOpen} onClose={closeWizard} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Create New Product"}
          <IconButton
            aria-label="close"
            onClick={closeWizard}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <StepWizard
              steps={wizardSteps}
              activeStep={activeStep}
              onNext={handleNext}
              onBack={handleBack}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
              confirmLabel={editingProduct ? "Save Changes" : "Confirm"}
              submittingLabel={editingProduct ? "Updating..." : "Creating..."}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <>
              {isLoadingPaletteCount ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} color="secondary" />
                </Box>
              ) : (
                <Typography>
                  {activePaletteCount > 0
                    ? `This product is on ${String(activePaletteCount)} active palette${activePaletteCount !== 1 ? "s" : ""}. Deletion is blocked while active palettes contain this product.`
                    : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => void handleDelete()}
            color="error"
            variant="contained"
            disabled={
              deleteMutation.isPending ||
              isLoadingPaletteCount ||
              activePaletteCount > 0
            }
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <ViolationAlertDialog
        open={violationDialogOpen}
        onClose={closeViolationDialog}
        violations={violations}
      />
    </Box>
  );
};

export default ProductPage;
