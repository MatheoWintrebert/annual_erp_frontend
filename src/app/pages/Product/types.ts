export type { RuleViolation } from "../../components/ViolationAlertDialog";
import type { RuleViolation } from "../../components/ViolationAlertDialog";

export interface ProductResponse {
  id: number;
  reference: string;
  name: string;
  unitOfMeasureId: number;
  categoryId: number | null;
  minimumStock: number | null;
  expiryAlertThreshold: number | null;
  ruleIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductResponse extends ProductResponse {
  violations: RuleViolation[];
}

export interface ProductsListResponse {
  products: ProductResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  categories: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitsOfMeasureListResponse {
  unitsOfMeasure: UnitOfMeasure[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RuleOption {
  id: number;
  name: string;
  description: string;
  ruleType: string;
}

export interface RulesListResponse {
  rules: RuleOption[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductWizardFormData {
  reference: string;
  name: string;
  categoryId: number | "";
  unitOfMeasureId: number | "";
  minimumStock: number | "";
  expiryAlertThreshold: number | "";
  ruleIds: number[];
}

export interface CreateProductPayload {
  reference: string;
  name: string;
  unitOfMeasureId: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

export interface UpdateProductPayload {
  reference?: string;
  name?: string;
  unitOfMeasureId?: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

export interface CreateCategoryPayload {
  name: string;
}

export interface CreateUnitOfMeasurePayload {
  name: string;
  abbreviation: string;
}

export const getDefaultProductFormData = (): ProductWizardFormData => ({
  reference: "",
  name: "",
  categoryId: "",
  unitOfMeasureId: "",
  minimumStock: "",
  expiryAlertThreshold: "",
  ruleIds: [],
});

export const prefillFromExisting = (
  product: ProductResponse
): ProductWizardFormData => ({
  reference: product.reference,
  name: product.name,
  categoryId: product.categoryId ?? "",
  unitOfMeasureId: product.unitOfMeasureId,
  minimumStock: product.minimumStock ?? "",
  expiryAlertThreshold: product.expiryAlertThreshold ?? "",
  ruleIds: product.ruleIds,
});
