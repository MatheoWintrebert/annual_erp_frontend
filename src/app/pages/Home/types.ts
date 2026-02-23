export interface ExpiryAlert {
  productId: number;
  productName: string;
  productReference: string;
  totalQuantity: number;
  unitOfMeasureName: string;
  nearestExpiryDate: string;
  daysRemaining: number;
  expiryAlertThreshold: number;
  severity: "expired" | "critical" | "warning";
}

export interface LowStockAlert {
  productId: number;
  productName: string;
  productReference: string;
  currentQuantity: number;
  minimumStock: number;
  deficit: number;
  unitOfMeasureName: string;
}

export interface DashboardAlertsResponse {
  expiryAlerts: ExpiryAlert[];
  lowStockAlerts: LowStockAlert[];
}

export interface StockSummary {
  totalPalettes: number;
  totalProducts: number;
  totalCapacity: number;
  capacityUtilization: number;
}

export interface IntakeActivity {
  palettesReceivedToday: number;
  palettesReceivedYesterday: number;
  trend: "increasing" | "decreasing" | "stable";
}

export interface SetupProgress {
  hasPalettiers: boolean;
  hasProducts: boolean;
  hasRules: boolean;
  hasStock: boolean;
  completedSteps: number;
  totalSteps: number;
}

export interface DashboardSummaryResponse {
  stock: StockSummary;
  intake: IntakeActivity;
  setup: SetupProgress;
}
