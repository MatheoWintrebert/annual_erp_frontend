import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import type { FC } from "react";
import type { PalettierType, PalettierResponse } from "../../Palettier/types";
import type { RuleWizardFormData, CategoryResponse } from "../types";
import {
  getRuleTypeLabel,
  getSelectionModeLabel,
  getPlacementConstraintLabel,
} from "../types";

interface RuleReviewStepProps {
  values: RuleWizardFormData;
  palettierTypes: PalettierType[];
  palettiers: PalettierResponse[];
  categories: CategoryResponse[];
}

const RuleReviewStep: FC<RuleReviewStepProps> = ({
  values,
  palettierTypes,
  palettiers,
  categories,
}) => {
  const getPalettierNames = (ids: number[]): string =>
    ids
      .map((id) => {
        const p = palettiers.find((pal) => pal.id === id);
        return p?.name ?? String(id);
      })
      .join(", ") || "—";

  const getPalettierTypeName = (typeId: number | ""): string => {
    if (typeId === "") return "—";
    const pt = palettierTypes.find((t) => t.id === typeId);
    return pt?.name ?? String(typeId);
  };

  const getCategoryName = (categoryId: number | ""): string => {
    if (categoryId === "") return "—";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? String(categoryId);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" color="text.primary">
        Review Rule Details
      </Typography>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Name
        </Typography>
        <Typography variant="body1">{values.name || "—"}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Description
        </Typography>
        <Typography variant="body1">{values.description || "—"}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Type
        </Typography>
        <Typography variant="body1">
          {values.type ? getRuleTypeLabel(values.type) : "—"}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Status
        </Typography>
        <Chip
          label={values.isActive ? "Active" : "Inactive"}
          color={values.isActive ? "success" : "default"}
          size="small"
        />
      </Box>

      <Divider />

      {values.type === "zone_priority" && (
        <>
          <Typography variant="subtitle1" fontWeight={500}>
            Zone Priority Configuration
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Priority Level
            </Typography>
            <Typography variant="body1">
              {values.zonePriority.priorityLevel}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Palettiers
            </Typography>
            <Typography variant="body1">
              {getPalettierNames(values.zonePriority.palettierIds)}
            </Typography>
          </Box>
        </>
      )}

      {values.type === "product_incompatibility" && (
        <>
          <Typography variant="subtitle1" fontWeight={500}>
            Product Incompatibility Configuration
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1">
              {getCategoryName(values.productIncompatibility.categoryId)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Minimum Distance
            </Typography>
            <Typography variant="body1">
              {values.productIncompatibility.minimumDistance} slot
              {values.productIncompatibility.minimumDistance !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </>
      )}

      {values.type === "storage_condition" && (
        <>
          <Typography variant="subtitle1" fontWeight={500}>
            Storage Condition Configuration
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Condition Type
            </Typography>
            <Typography variant="body1">
              {values.storageCondition.conditionType || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Selection Mode
            </Typography>
            <Typography variant="body1">
              {getSelectionModeLabel(values.storageCondition.selectionMode)}
            </Typography>
          </Box>
          {values.storageCondition.selectionMode === "palettier_type" && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Palettier Type
              </Typography>
              <Typography variant="body1">
                {getPalettierTypeName(values.storageCondition.palettierTypeId)}
              </Typography>
            </Box>
          )}
          {values.storageCondition.selectionMode === "specific_palettier" && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Palettiers
              </Typography>
              <Typography variant="body1">
                {getPalettierNames(values.storageCondition.palettierIds)}
              </Typography>
            </Box>
          )}
        </>
      )}

      {values.type === "placement_constraint" && (
        <>
          <Typography variant="subtitle1" fontWeight={500}>
            Placement Constraint Configuration
          </Typography>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Constraint Type
            </Typography>
            <Typography variant="body1">
              {values.placementConstraint.constraintType
                ? getPlacementConstraintLabel(
                    values.placementConstraint.constraintType
                  )
                : "—"}
            </Typography>
          </Box>
          {values.placementConstraint.constraintType === "max_height" && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Maximum Height
              </Typography>
              <Typography variant="body1">
                {values.placementConstraint.maxHeight !== ""
                  ? `${String(values.placementConstraint.maxHeight)} slot${values.placementConstraint.maxHeight !== 1 ? "s" : ""}`
                  : "—"}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

export default RuleReviewStep;
