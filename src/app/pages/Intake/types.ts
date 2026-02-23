export interface IntakeProductEntry {
  productId: number | "";
  lotReference: string;
  isManualLot: boolean;
  expiryDate: string;
  quantity: number | "";
}

export interface IntakeFormData {
  items: IntakeProductEntry[];
}

export interface PlacementRecommendation {
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  reasoning: string;
}

export interface ConflictGroup {
  productIds: number[];
  productNames: string[];
  recommendation: PlacementRecommendation | null;
  reasoning: string;
}

export interface ResolvedPlacementResult {
  status: "resolved";
  recommendation: PlacementRecommendation;
}

export interface ConflictPlacementResult {
  status: "conflict";
  conflictExplanation: string;
  groups: ConflictGroup[];
}

export type PlacementResult = ResolvedPlacementResult | ConflictPlacementResult;

export interface ConflictGroupPlacement {
  useSystemRecommendation: boolean;
  palettierId: number | "";
  positionX: number | "";
  positionY: number | "";
  positionZ: number | "";
}

export interface RegisterConflictResolutionGroupPayload {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: RegisterPaletteContentItem[];
}

export interface RegisterConflictResolutionPayload {
  groups: RegisterConflictResolutionGroupPayload[];
}

export interface RegisterConflictResolutionResponse {
  palettes: RegisterPaletteResponse[];
}

export interface RegisterPaletteContentItem {
  productId: number;
  lotReference?: string;
  expiryDate?: string;
  quantity: number;
}

export interface RegisterPalettePayload {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: RegisterPaletteContentItem[];
}

export interface RegisterPaletteResponseItem {
  lotId: number;
  lotReference: string;
  productId: number;
  productName: string;
  quantity: number;
  expiryDate: string | null;
}

export interface RegisterPaletteResponse {
  paletteId: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: RegisterPaletteResponseItem[];
  createdAt: string;
}

export interface PalettierOption {
  id: number;
  name: string;
  width: number;
  depth: number;
  height: number;
}

export interface ProductOption {
  id: number;
  name: string;
  reference: string;
  unitOfMeasureId: number;
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

export interface UnitOfMeasure {
  id: number;
  name: string;
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

const getDefaultProductEntry = (): IntakeProductEntry => ({
  productId: "",
  lotReference: "",
  isManualLot: false,
  expiryDate: "",
  quantity: "",
});

export { getDefaultProductEntry };

export const getDefaultIntakeFormData = (): IntakeFormData => ({
  items: [getDefaultProductEntry()],
});

export const getUnitName = (
  productId: number | "",
  products: ProductOption[],
  unitsOfMeasure: UnitOfMeasure[]
): string => {
  if (productId === "") return "";
  const product = products.find((p) => p.id === productId);
  if (!product) return "";
  return (
    unitsOfMeasure.find((u) => u.id === product.unitOfMeasureId)?.name ?? ""
  );
};

export const buildRegisterPayload = (
  form: IntakeFormData,
  recommendation: PlacementRecommendation
): RegisterPalettePayload => {
  const items: RegisterPaletteContentItem[] = form.items.map((entry) => {
    const item: RegisterPaletteContentItem = {
      productId: entry.productId as number,
      quantity: entry.quantity as number,
    };

    if (entry.isManualLot && entry.lotReference !== "") {
      item.lotReference = entry.lotReference;
    }

    if (entry.expiryDate !== "") {
      item.expiryDate = entry.expiryDate;
    }

    return item;
  });

  return {
    palettierId: recommendation.palettierId,
    positionX: recommendation.positionX,
    positionY: recommendation.positionY,
    positionZ: recommendation.positionZ,
    items,
  };
};

export const buildConflictResolutionPayload = (
  formItems: IntakeProductEntry[],
  groups: ConflictGroup[],
  placements: ConflictGroupPlacement[]
): RegisterConflictResolutionPayload => {
  const payloadGroups = groups.map((group, index) => {
    const placement = placements[index];

    let palettierId: number;
    let positionX: number;
    let positionY: number;
    let positionZ: number;

    if (placement.useSystemRecommendation) {
      // H6 fix: throw instead of silently sending palettierId: 0
      if (group.recommendation == null) {
        throw new Error(
          `Group ${String(index + 1)} uses system recommendation but none exists`
        );
      }
      palettierId = group.recommendation.palettierId;
      positionX = group.recommendation.positionX;
      positionY = group.recommendation.positionY;
      positionZ = group.recommendation.positionZ;
    } else {
      // M8 fix: proper guard instead of unsafe `as number` cast
      if (
        placement.palettierId === "" ||
        placement.positionX === "" ||
        placement.positionY === "" ||
        placement.positionZ === ""
      ) {
        throw new Error(
          `Group ${String(index + 1)} has incomplete manual placement`
        );
      }
      palettierId = placement.palettierId;
      positionX = placement.positionX;
      positionY = placement.positionY;
      positionZ = placement.positionZ;
    }

    const items: RegisterPaletteContentItem[] = group.productIds.map(
      (productId) => {
        // M8 fix: proper equality guard instead of `as number` cast
        const entry = formItems.find(
          (e) => e.productId !== "" && e.productId === productId
        );
        const item: RegisterPaletteContentItem = {
          productId,
          quantity: typeof entry?.quantity === "number" ? entry.quantity : 0,
        };
        if (entry?.isManualLot && entry.lotReference !== "") {
          item.lotReference = entry.lotReference;
        }
        if (entry && entry.expiryDate !== "") {
          item.expiryDate = entry.expiryDate;
        }
        return item;
      }
    );

    return { palettierId, positionX, positionY, positionZ, items };
  });

  return { groups: payloadGroups };
};
