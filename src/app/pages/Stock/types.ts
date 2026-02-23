import type { RuleViolation } from "../../types/rule-violation";

export type { RuleViolation };

export function buildViolationsMap(
  violations: RuleViolation[],
): Map<number, RuleViolation[]> {
  const map = new Map<number, RuleViolation[]>();
  for (const v of violations) {
    const existing = map.get(v.paletteId) ?? [];
    existing.push(v);
    map.set(v.paletteId, existing);
  }
  return map;
}

export interface PaletteItemDetail {
  productId: number;
  productName: string;
  productReference: string;
  lotReference: string;
  quantity: number;
  expiryDate: string | null;
  unitOfMeasureName: string;
}

export interface PaletteListItem {
  id: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  receivedAt: string;
  items: PaletteItemDetail[];
}

export interface PaletteTableRow {
  paletteId: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  productName: string;
  productReference: string;
  lotReference: string;
  quantity: number;
  expiryDate: string | null;
  unitOfMeasureName: string;
  receivedAt: string;
}

export type SortField =
  | "palettierName"
  | "productName"
  | "expiryDate"
  | "receivedAt";

export type SortDirection = "asc" | "desc";

export function flattenPalettes(palettes: PaletteListItem[]): PaletteTableRow[] {
  return palettes.flatMap((palette) => {
    if (palette.items.length === 0) {
      return [
        {
          paletteId: palette.id,
          palettierId: palette.palettierId,
          palettierName: palette.palettierName,
          positionX: palette.positionX,
          positionY: palette.positionY,
          positionZ: palette.positionZ,
          productName: "",
          productReference: "",
          lotReference: "",
          quantity: 0,
          expiryDate: null,
          unitOfMeasureName: "",
          receivedAt: palette.receivedAt,
        },
      ];
    }
    return palette.items.map((item) => ({
      paletteId: palette.id,
      palettierId: palette.palettierId,
      palettierName: palette.palettierName,
      positionX: palette.positionX,
      positionY: palette.positionY,
      positionZ: palette.positionZ,
      productName: item.productName,
      productReference: item.productReference,
      lotReference: item.lotReference,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      unitOfMeasureName: item.unitOfMeasureName,
      receivedAt: palette.receivedAt,
    }));
  });
}

export function formatPosition(x: number, y: number, z: number): string {
  return `${String(x)}-${String(y)}-${String(z)}`;
}

export interface EditPaletteData {
  paletteId: number;
  palettierName: string;
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export interface OnboardingProductEntry {
  productId: number;
  productName: string;
  productReference: string;
  lotReference: string;
  manualLot: boolean;
  expiryDate: string | null;
  quantity: number;
  unitOfMeasureName: string;
}

export interface PlacementViolationWarning {
  ruleName: string;
  ruleType: string;
  reason: string;
}

export interface OnboardingFormValues {
  products: OnboardingProductEntry[];
  palettierId: number | null;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export interface ProductOption {
  id: number;
  name: string;
  reference: string;
  unitOfMeasureId: number;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
}

export interface ProductsListResponse {
  products: ProductOption[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
