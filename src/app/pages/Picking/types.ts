export interface ProductOption {
  id: number;
  name: string;
  reference: string;
  unitOfMeasureName: string;
}

export interface AvailableStockItem {
  productId: number;
  productName: string;
  productReference: string;
  availableQuantity: number;
  unitOfMeasureName: string;
}

export interface PickingProductEntry {
  product: ProductOption | null;
  requestedQuantity: number;
  availableStock: number | null;
}

export interface PickingFormData {
  items: PickingProductEntry[];
}

export interface CreatePickingListPayload {
  items: { productId: number; requestedQuantity: number }[];
}

export interface PickingListResponse {
  id: number;
  status: string;
  items: {
    id: number;
    productId: number;
    productName: string;
    requestedQuantity: number;
  }[];
  createdAt: string;
}

export interface PickRouteItem {
  pickingListItemId: number;
  productId: number;
  productName: string;
  productReference: string;
  palettierName: string;
  paletteId: number;
  paletteLotId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  quantityToPick: number;
  expiryDate: string | null;
  lotReference: string;
}

export function getDefaultPickingEntry(): PickingProductEntry {
  return { product: null, requestedQuantity: 1, availableStock: null };
}

export function getDefaultPickingFormData(): PickingFormData {
  return { items: [getDefaultPickingEntry()] };
}

export function buildCreatePickingListPayload(
  data: PickingFormData
): CreatePickingListPayload {
  return {
    items: data.items
      .filter((item) => item.product !== null)
      .map((item) => ({
        productId: item.product!.id,
        requestedQuantity: item.requestedQuantity,
      })),
  };
}

export function hasInsufficientStock(items: PickingProductEntry[]): boolean {
  return items.some(
    (item) =>
      item.product !== null &&
      item.availableStock !== null &&
      item.requestedQuantity > item.availableStock
  );
}

// Status of each pick item during execution
export type PickItemStatus = "pending" | "picked" | "skipped";

// Local state for each item during pick execution
export interface PickExecutionItem extends PickRouteItem {
  status: PickItemStatus;
  actualQuantity: number; // editable quantity, defaults to quantityToPick
}

// Payload for completing a picking list
export interface CompletePickingListPayload {
  items: {
    pickingListItemId: number;
    paletteLotId: number;
    status: "picked" | "skipped";
    pickedQuantity: number;
  }[];
}

// Response from complete picking list
export interface PickingCompletionResponse {
  pickingListId: number;
  status: string;
  totalItemsPicked: number;
  totalItemsSkipped: number;
  deductions: {
    paletteLotId: number;
    productName: string;
    quantityDeducted: number;
    palettierName: string;
    positionX: number;
    positionY: number;
    positionZ: number;
  }[];
  discrepancies: {
    pickingListItemId: number;
    productName: string;
    palettierName: string;
    positionX: number;
    positionY: number;
    positionZ: number;
    reason: string;
  }[];
}

// Response from cancel picking list
export interface CancelPickingListResponse {
  pickingListId: number;
  status: string;
}

// Helper: convert route items to execution items
export function toExecutionItems(route: PickRouteItem[]): PickExecutionItem[] {
  return route.map((item) => ({
    ...item,
    status: "pending" as PickItemStatus,
    actualQuantity: item.quantityToPick,
  }));
}

// Helper: build completion payload from execution items
export function buildCompletionPayload(
  items: PickExecutionItem[]
): CompletePickingListPayload {
  return {
    items: items.map((item) => ({
      pickingListItemId: item.pickingListItemId,
      paletteLotId: item.paletteLotId,
      status:
        item.status === "skipped" ? ("skipped" as const) : ("picked" as const),
      pickedQuantity: item.status === "skipped" ? 0 : item.actualQuantity,
    })),
  };
}

// Helper: check if all items have been actioned (picked or skipped)
export function allItemsActioned(items: PickExecutionItem[]): boolean {
  return items.every((item) => item.status !== "pending");
}
