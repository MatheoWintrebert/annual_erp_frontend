import { Box, Divider, Stack, Typography } from "@mui/material";
import type { FC } from "react";
import type {
  ProductWizardFormData,
  Category,
  UnitOfMeasure,
  RuleOption,
} from "../types";

interface ProductReviewStepProps {
  values: ProductWizardFormData;
  categories: Category[];
  unitsOfMeasure: UnitOfMeasure[];
  rules: RuleOption[];
}

const ProductReviewStep: FC<ProductReviewStepProps> = ({
  values,
  categories,
  unitsOfMeasure,
  rules,
}) => {
  const getCategoryName = (categoryId: number | ""): string => {
    if (categoryId === "") return "—";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? String(categoryId);
  };

  const getUnitName = (unitOfMeasureId: number | ""): string => {
    if (unitOfMeasureId === "") return "—";
    const unit = unitsOfMeasure.find((u) => u.id === unitOfMeasureId);
    return unit
      ? `${unit.name} (${unit.abbreviation})`
      : String(unitOfMeasureId);
  };

  const getRuleNames = (ruleIds: number[]): string =>
    ruleIds
      .map((id) => {
        const r = rules.find((rule) => rule.id === id);
        return r?.name ?? String(id);
      })
      .join(", ") || "None";

  return (
    <Stack spacing={2}>
      <Typography variant="h6" color="text.primary">
        Review Product Details
      </Typography>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Reference Code
        </Typography>
        <Typography variant="body1">{values.reference || "—"}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Product Name
        </Typography>
        <Typography variant="body1">{values.name || "—"}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Category
        </Typography>
        <Typography variant="body1">
          {getCategoryName(values.categoryId)}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Unit of Measure
        </Typography>
        <Typography variant="body1">
          {getUnitName(values.unitOfMeasureId)}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Low-Stock Alert Threshold
        </Typography>
        <Typography variant="body1">
          {values.minimumStock !== "" ? String(values.minimumStock) : "—"}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Expiry Alert Threshold
        </Typography>
        <Typography variant="body1">
          {values.expiryAlertThreshold !== ""
            ? `${String(values.expiryAlertThreshold)} day${values.expiryAlertThreshold !== 1 ? "s" : ""}`
            : "—"}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Placement Rules
        </Typography>
        <Typography variant="body1">{getRuleNames(values.ruleIds)}</Typography>
      </Box>
    </Stack>
  );
};

export default ProductReviewStep;
