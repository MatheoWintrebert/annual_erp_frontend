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
import ViolationAlertDialog from "../../components/ViolationAlertDialog";
import type { RuleViolation } from "../../components/ViolationAlertDialog";
import { RuleList, RuleFormStep, RuleReviewStep } from "./components";
import {
  useGetRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  useGetCategories,
} from "./api";
import { useGetPalettiers, useGetPalettierTypes } from "../Palettier/api";
import type {
  RuleResponse,
  RuleWizardFormData,
  CreateRulePayload,
  UpdateRulePayload,
} from "./types";
import { WIZARD_DEFAULT_VALUES, prefillFromExisting } from "./types";

const buildTypeConfig = (
  data: RuleWizardFormData
): Partial<CreateRulePayload> => {
  switch (data.type) {
    case "zone_priority":
      return {
        zonePriorityConfig: {
          priorityLevel: data.zonePriority.priorityLevel,
          palettierIds: data.zonePriority.palettierIds,
        },
      };
    case "product_incompatibility":
      return {
        productIncompatibilityConfig: {
          categoryId: data.productIncompatibility.categoryId as number,
          minimumDistance: data.productIncompatibility.minimumDistance,
        },
      };
    case "storage_condition":
      return {
        storageConditionConfig: {
          conditionType: data.storageCondition.conditionType,
          selectionMode: data.storageCondition.selectionMode,
          ...(data.storageCondition.selectionMode === "palettier_type"
            ? {
                palettierTypeId: data.storageCondition
                  .palettierTypeId as number,
              }
            : { palettierIds: data.storageCondition.palettierIds }),
        },
      };
    case "placement_constraint":
      return {
        placementConstraintConfig: {
          constraintType: data.placementConstraint.constraintType as
            | "ground_only"
            | "max_height",
          ...(data.placementConstraint.constraintType === "max_height"
            ? { maxHeight: data.placementConstraint.maxHeight as number }
            : {}),
        },
      };
    default:
      return {};
  }
};

const buildCreatePayload = (data: RuleWizardFormData): CreateRulePayload => ({
  name: data.name,
  description: data.description || null,
  type: data.type as CreateRulePayload["type"],
  isActive: data.isActive,
  ...buildTypeConfig(data),
});

const buildUpdatePayload = (data: RuleWizardFormData): UpdateRulePayload => ({
  name: data.name,
  description: data.description || null,
  isActive: data.isActive,
  ...buildTypeConfig(data),
});

const RulesPage: FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleResponse | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<RuleResponse | null>(null);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [violationDialogOpen, setViolationDialogOpen] = useState(false);

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const {
    data: rulesData,
    isLoading: isLoadingRules,
    error: rulesError,
  } = useGetRules();

  const rules = rulesData?.rules ?? [];

  const { data: palettierTypesData } = useGetPalettierTypes();
  const palettierTypes = palettierTypesData ?? [];

  const { data: palettiersData } = useGetPalettiers();
  const palettiers = palettiersData ?? [];

  const { data: categoriesData } = useGetCategories();
  const categories = categoriesData?.categories ?? [];

  const createMutation = useCreateRule();
  const updateMutation = useUpdateRule();
  const deleteMutation = useDeleteRule();

  const methods = useForm<RuleWizardFormData>({
    defaultValues: WIZARD_DEFAULT_VALUES,
  });

  const openCreateWizard = useCallback((): void => {
    setEditingRule(null);
    methods.reset(WIZARD_DEFAULT_VALUES);
    setActiveStep(0);
    setWizardOpen(true);
  }, [methods]);

  const openEditWizard = useCallback(
    (rule: RuleResponse): void => {
      setEditingRule(rule);
      methods.reset(prefillFromExisting(rule));
      setActiveStep(0);
      setWizardOpen(true);
    },
    [methods]
  );

  const closeWizard = useCallback((): void => {
    setWizardOpen(false);
    setEditingRule(null);
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
    void methods.handleSubmit(async (data: RuleWizardFormData) => {
      try {
        if (editingRule) {
          const result = await updateMutation.mutateAsync({
            id: editingRule.id,
            ...buildUpdatePayload(data),
          });
          closeWizard();
          if (result.violations.length > 0) {
            setViolations(result.violations);
            setViolationDialogOpen(true);
          } else {
            showSnackbar("Rule updated successfully", "success");
          }
        } else {
          await createMutation.mutateAsync(buildCreatePayload(data));
          showSnackbar("Rule created successfully", "success");
          closeWizard();
        }
      } catch (err) {
        void handleError(err);
      }
    })();
  }, [
    methods,
    editingRule,
    createMutation,
    updateMutation,
    closeWizard,
    showSnackbar,
    handleError,
  ]);

  const openDeleteDialog = useCallback((rule: RuleResponse): void => {
    setDeleteTarget(rule);
  }, []);

  const closeDeleteDialog = useCallback((): void => {
    setDeleteTarget(null);
  }, []);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSnackbar("Rule deleted successfully", "success");
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

  const deleteProductCount = deleteTarget?.productIds?.length ?? 0;

  const wizardSteps = [
    {
      label: "Details",
      content: (
        <RuleFormStep
          methods={methods}
          palettierTypes={palettierTypes}
          palettiers={palettiers}
          categories={categories}
          isEditing={!!editingRule}
        />
      ),
    },
    {
      label: "Review",
      content: (
        <RuleReviewStep
          values={methods.getValues()}
          palettierTypes={palettierTypes}
          palettiers={palettiers}
          categories={categories}
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
            Placement Rule Management
          </Typography>

          <RuleList
            rules={rules}
            isLoading={isLoadingRules}
            error={rulesError}
            onCreateNew={openCreateWizard}
            onEdit={openEditWizard}
            onDelete={openDeleteDialog}
          />
        </Container>
      </Box>
      <Footer />

      <Dialog open={wizardOpen} onClose={closeWizard} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRule ? "Edit Rule" : "Create New Rule"}
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
              confirmLabel={editingRule ? "Save Changes" : "Confirm"}
              submittingLabel={editingRule ? "Updating..." : "Creating..."}
            />
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Rule</DialogTitle>
        <DialogContent>
          {deleteTarget && (
            <Typography>
              {deleteProductCount > 0
                ? `This rule is used by ${String(deleteProductCount)} product${deleteProductCount !== 1 ? "s" : ""}. Are you sure you want to delete "${deleteTarget.name}"?`
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
            disabled={deleteMutation.isPending}
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

export default RulesPage;
