export const RULE_TYPES = [
  {
    value: "zone_priority",
    label: "Zone Priority",
    description: "Prioritize specific palettiers for product types",
  },
  {
    value: "product_incompatibility",
    label: "Product Incompatibility",
    description: "Maintain minimum distance between incompatible product types",
  },
  {
    value: "storage_condition",
    label: "Storage Condition",
    description: "Temperature, humidity, or environmental constraints",
  },
  {
    value: "placement_constraint",
    label: "Placement Constraint",
    description: "Restrictions on physical position (height, ground, etc.)",
  },
] as const;

export type RuleType = (typeof RULE_TYPES)[number]["value"];

export const SELECTION_MODES = [
  { value: "palettier_type", label: "By palettier type" },
  { value: "specific_palettier", label: "By specific palettiers" },
] as const;

export type SelectionMode = (typeof SELECTION_MODES)[number]["value"];

export const PLACEMENT_CONSTRAINT_TYPES = [
  { value: "ground_only", label: "Ground only" },
  { value: "max_height", label: "Maximum height" },
] as const;

export type PlacementConstraintType =
  (typeof PLACEMENT_CONSTRAINT_TYPES)[number]["value"];

export interface ZonePriorityConfigResponse {
  id: number;
  priorityLevel: number;
  palettierIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductIncompatibilityConfigResponse {
  id: number;
  categoryId: number;
  minimumDistance: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorageConditionConfigResponse {
  id: number;
  conditionType: string;
  selectionMode: SelectionMode;
  palettierTypeId: number | null;
  palettierIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacementConstraintConfigResponse {
  id: number;
  constraintType: PlacementConstraintType;
  maxHeight: number | null;
  createdAt: string;
  updatedAt: string;
}

export type { RuleViolation } from "../../components/ViolationAlertDialog";
import type { RuleViolation } from "../../components/ViolationAlertDialog";

export interface RuleResponse {
  id: number;
  name: string;
  description: string | null;
  type: RuleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  zonePriorityConfig?: ZonePriorityConfigResponse;
  productIncompatibilityConfig?: ProductIncompatibilityConfigResponse;
  storageConditionConfig?: StorageConditionConfigResponse;
  placementConstraintConfig?: PlacementConstraintConfigResponse;
  productIds?: number[];
}

export interface UpdateRuleResponse extends RuleResponse {
  violations: RuleViolation[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RulesListResponse {
  rules: RuleResponse[];
  meta: PaginationMeta;
}

export interface RuleBatchResponse {
  rules: RuleResponse[];
  count: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  categories: CategoryResponse[];
  meta: PaginationMeta;
}

export interface CreateRulePayload {
  name: string;
  description?: string | null;
  type: RuleType;
  isActive?: boolean;
  zonePriorityConfig?: {
    priorityLevel: number;
    palettierIds: number[];
  };
  productIncompatibilityConfig?: {
    categoryId: number;
    minimumDistance: number;
  };
  storageConditionConfig?: {
    conditionType: string;
    selectionMode: SelectionMode;
    palettierTypeId?: number | null;
    palettierIds?: number[];
  };
  placementConstraintConfig?: {
    constraintType: PlacementConstraintType;
    maxHeight?: number | null;
  };
}

export interface UpdateRulePayload {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  zonePriorityConfig?: {
    priorityLevel?: number;
    palettierIds?: number[];
  };
  productIncompatibilityConfig?: {
    categoryId?: number;
    minimumDistance?: number;
  };
  storageConditionConfig?: {
    conditionType?: string;
    selectionMode?: SelectionMode;
    palettierTypeId?: number | null;
    palettierIds?: number[];
  };
  placementConstraintConfig?: {
    constraintType?: PlacementConstraintType;
    maxHeight?: number | null;
  };
}

export interface RuleWizardFormData {
  name: string;
  description: string;
  type: RuleType | "";
  isActive: boolean;
  zonePriority: {
    priorityLevel: number;
    palettierIds: number[];
  };
  productIncompatibility: {
    categoryId: number | "";
    minimumDistance: number;
  };
  storageCondition: {
    conditionType: string;
    selectionMode: SelectionMode;
    palettierTypeId: number | "";
    palettierIds: number[];
  };
  placementConstraint: {
    constraintType: PlacementConstraintType | "";
    maxHeight: number | "";
  };
}

export const WIZARD_DEFAULT_VALUES: RuleWizardFormData = {
  name: "",
  description: "",
  type: "",
  isActive: true,
  zonePriority: {
    priorityLevel: 1,
    palettierIds: [],
  },
  productIncompatibility: {
    categoryId: "",
    minimumDistance: 1,
  },
  storageCondition: {
    conditionType: "",
    selectionMode: "palettier_type",
    palettierTypeId: "",
    palettierIds: [],
  },
  placementConstraint: {
    constraintType: "",
    maxHeight: "",
  },
};

export const getRuleTypeLabel = (type: RuleType): string => {
  const found = RULE_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
};

export const getSelectionModeLabel = (mode: SelectionMode): string => {
  const found = SELECTION_MODES.find((m) => m.value === mode);
  return found?.label ?? mode;
};

export const getPlacementConstraintLabel = (
  type: PlacementConstraintType
): string => {
  const found = PLACEMENT_CONSTRAINT_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
};

export const prefillFromExisting = (
  rule: RuleResponse
): RuleWizardFormData => ({
  name: rule.name,
  description: rule.description ?? "",
  type: rule.type,
  isActive: rule.isActive,
  zonePriority: {
    priorityLevel: rule.zonePriorityConfig?.priorityLevel ?? 1,
    palettierIds: rule.zonePriorityConfig?.palettierIds ?? [],
  },
  productIncompatibility: {
    categoryId: rule.productIncompatibilityConfig?.categoryId ?? "",
    minimumDistance: rule.productIncompatibilityConfig?.minimumDistance ?? 1,
  },
  storageCondition: {
    conditionType: rule.storageConditionConfig?.conditionType ?? "",
    selectionMode:
      rule.storageConditionConfig?.selectionMode ?? "palettier_type",
    palettierTypeId: rule.storageConditionConfig?.palettierTypeId ?? "",
    palettierIds: rule.storageConditionConfig?.palettierIds ?? [],
  },
  placementConstraint: {
    constraintType: rule.placementConstraintConfig?.constraintType ?? "",
    maxHeight: rule.placementConstraintConfig?.maxHeight ?? "",
  },
});
