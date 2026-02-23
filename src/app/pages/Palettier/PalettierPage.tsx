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
import {
  PalettierList,
  PalettierFormStep,
  PalettierReviewStep,
} from "./components";
import {
  useGetPalettiers,
  useGetPalettierTypes,
  useCreatePalettier,
  useCreatePalettierType,
  useUpdatePalettier,
  useDeletePalettier,
  useGetPaletteCountByPalettier,
  useGetActiveViolations,
} from "./api";
import type {
  PalettierResponse,
  PalettierType,
  PalettierWizardFormData,
} from "./types";
import { WIZARD_DEFAULT_VALUES } from "./types";

const PalettierPage: FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingPalettier, setEditingPalettier] =
    useState<PalettierResponse | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<PalettierResponse | null>(
    null
  );

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const {
    data: palettiers = [],
    isLoading: isLoadingPalettiers,
    error: palettiersError,
  } = useGetPalettiers();

  const { data: palettierTypes = [] } = useGetPalettierTypes();
  const { data: activeViolations = [] } = useGetActiveViolations();

  const createMutation = useCreatePalettier();
  const createTypeMutation = useCreatePalettierType();
  const updateMutation = useUpdatePalettier();
  const deleteMutation = useDeletePalettier();

  const { data: paletteCountData } = useGetPaletteCountByPalettier(
    editingPalettier?.id ?? 0
  );

  const { data: deleteTargetCountData } = useGetPaletteCountByPalettier(
    deleteTarget?.id ?? 0
  );

  const methods = useForm<PalettierWizardFormData>({
    defaultValues: WIZARD_DEFAULT_VALUES,
  });

  const openCreateWizard = useCallback((): void => {
    setEditingPalettier(null);
    methods.reset(WIZARD_DEFAULT_VALUES);
    setActiveStep(0);
    setWizardOpen(true);
  }, [methods]);

  const openEditWizard = useCallback(
    (palettier: PalettierResponse): void => {
      setEditingPalettier(palettier);
      methods.reset({
        name: palettier.name,
        typeId: palettier.palettierTypeId ?? "",
        isNewType: false,
        newTypeName: "",
        width: palettier.width,
        depth: palettier.depth,
        height: palettier.height,
      });
      setActiveStep(0);
      setWizardOpen(true);
    },
    [methods]
  );

  const closeWizard = useCallback((): void => {
    setWizardOpen(false);
    setEditingPalettier(null);
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

  const handleAddNewType = useCallback(
    async (name: string): Promise<void> => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const existing = palettierTypes.find(
        (t: PalettierType) => t.name.toLowerCase() === trimmed.toLowerCase()
      );

      if (existing) {
        methods.setValue("typeId", existing.id);
        methods.setValue("isNewType", false);
        methods.setValue("newTypeName", "");
        return;
      }

      try {
        const newType = await createTypeMutation.mutateAsync({
          name: trimmed,
          description: "",
        });
        methods.setValue("typeId", newType.id);
        methods.setValue("isNewType", false);
        methods.setValue("newTypeName", "");
        showSnackbar(`Type "${newType.name}" created`, "success");
      } catch (err) {
        void handleError(err);
      }
    },
    [palettierTypes, methods, createTypeMutation, showSnackbar, handleError]
  );

  const handleConfirm = useCallback((): void => {
    void methods.handleSubmit(async (data: PalettierWizardFormData) => {
      try {
        if (editingPalettier) {
          await updateMutation.mutateAsync({
            id: editingPalettier.id,
            name: data.name,
            palettierTypeId: data.typeId === "" ? null : data.typeId,
            width: data.width,
            depth: data.depth,
            height: data.height,
          });
          showSnackbar("Palettier updated successfully", "success");
        } else {
          const payload = data.isNewType
            ? {
                name: data.name,
                newTypeName: data.newTypeName,
                width: data.width,
                depth: data.depth,
                height: data.height,
              }
            : {
                name: data.name,
                typeId: data.typeId as number,
                width: data.width,
                depth: data.depth,
                height: data.height,
              };

          await createMutation.mutateAsync(payload);
          showSnackbar("Palettier created successfully", "success");
        }
        closeWizard();
      } catch (err) {
        void handleError(err);
      }
    })();
  }, [
    methods,
    editingPalettier,
    createMutation,
    updateMutation,
    closeWizard,
    showSnackbar,
    handleError,
  ]);

  const openDeleteDialog = useCallback((palettier: PalettierResponse): void => {
    setDeleteTarget(palettier);
  }, []);

  const closeDeleteDialog = useCallback((): void => {
    setDeleteTarget(null);
  }, []);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSnackbar("Palettier deleted successfully", "success");
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

  const paletteWarning =
    editingPalettier && paletteCountData && paletteCountData.paletteCount > 0
      ? `This palettier contains ${String(paletteCountData.paletteCount)} palette${paletteCountData.paletteCount !== 1 ? "s" : ""} in ${String(paletteCountData.occupiedPositions)} position${paletteCountData.occupiedPositions !== 1 ? "s" : ""}`
      : undefined;

  const deleteHasPalettes =
    deleteTargetCountData && deleteTargetCountData.paletteCount > 0;

  const wizardSteps = [
    {
      label: "Details",
      content: (
        <PalettierFormStep
          methods={methods}
          palettierTypes={palettierTypes}
          onAddNewType={handleAddNewType}
          paletteWarning={paletteWarning}
        />
      ),
    },
    {
      label: "Review",
      content: (
        <PalettierReviewStep
          values={methods.getValues()}
          palettierTypes={palettierTypes}
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
            Palettier Configuration
          </Typography>

          <PalettierList
            palettiers={palettiers}
            palettierTypes={palettierTypes}
            isLoading={isLoadingPalettiers}
            error={palettiersError}
            violations={activeViolations}
            onCreateNew={openCreateWizard}
            onEdit={openEditWizard}
            onDelete={openDeleteDialog}
          />
        </Container>
      </Box>
      <Footer />

      {/* Create/Edit Wizard Dialog */}
      <Dialog open={wizardOpen} onClose={closeWizard} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPalettier ? "Edit Palettier" : "Create New Palettier"}
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
              confirmLabel={editingPalettier ? "Save Changes" : "Confirm"}
              submittingLabel={editingPalettier ? "Updating..." : "Creating..."}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Palettier</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <Typography>
              {deleteHasPalettes
                ? `This palettier contains ${String(deleteTargetCountData.paletteCount)} palette${deleteTargetCountData.paletteCount !== 1 ? "s" : ""} in ${String(deleteTargetCountData.occupiedPositions)} position${deleteTargetCountData.occupiedPositions !== 1 ? "s" : ""}. You must remove all palettes before deleting this palettier.`
                : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
            </Typography>
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
            disabled={!!deleteHasPalettes || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PalettierPage;
