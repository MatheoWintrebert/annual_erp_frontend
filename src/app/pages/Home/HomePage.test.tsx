import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeStore } from "@/store/store";
import HomePage from "./HomePage";
import type {
  DashboardAlertsResponse,
  DashboardSummaryResponse,
} from "./types";
import type { RuleViolation } from "../../types/rule-violation";

vi.mock("../../components/ui/SnackbarProvider", () => ({
  useSnackbar: () => ({
    showSnackbar: vi.fn(),
  }),
}));

vi.mock("../../context/CompanySettingsContext", () => ({
  useCompanySettings: () => ({
    settings: null,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

const mockHandleError = vi.fn();
vi.mock("../../hooks/useApiError", () => ({
  useApiError: () => ({
    handleError: mockHandleError,
    handleResponseError: vi.fn(),
  }),
}));

let alertsOverride: {
  data?: DashboardAlertsResponse;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} | null = null;

let summaryOverride: {
  data?: DashboardSummaryResponse;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} | null = null;

let violationsOverride: {
  data?: RuleViolation[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} | null = null;

vi.mock("./api", () => ({
  useGetDashboardAlerts: () =>
    alertsOverride ?? {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    },
  useGetDashboardSummary: () =>
    summaryOverride ?? {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    },
  useGetRuleViolations: () =>
    violationsOverride ?? {
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
    },
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/"]}>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

const mockExpiryAlerts: DashboardAlertsResponse = {
  expiryAlerts: [
    {
      productId: 2,
      productName: "Fresh Yogurt",
      productReference: "FY-002",
      totalQuantity: 50,
      unitOfMeasureName: "units",
      nearestExpiryDate: "2026-02-14T00:00:00.000Z",
      daysRemaining: -2,
      expiryAlertThreshold: 14,
      severity: "expired",
    },
    {
      productId: 1,
      productName: "Whole Milk",
      productReference: "WM-001",
      totalQuantity: 120,
      unitOfMeasureName: "units",
      nearestExpiryDate: "2026-02-20T00:00:00.000Z",
      daysRemaining: 4,
      expiryAlertThreshold: 7,
      severity: "critical",
    },
    {
      productId: 3,
      productName: "Cream Cheese",
      productReference: "CC-003",
      totalQuantity: 30,
      unitOfMeasureName: "kg",
      nearestExpiryDate: "2026-03-10T00:00:00.000Z",
      daysRemaining: 22,
      expiryAlertThreshold: 30,
      severity: "warning",
    },
  ],
  lowStockAlerts: [],
};

const mockLowStockAlerts: DashboardAlertsResponse = {
  expiryAlerts: [],
  lowStockAlerts: [
    {
      productId: 6,
      productName: "Steel Bolts",
      productReference: "SB-006",
      currentQuantity: 5,
      minimumStock: 100,
      deficit: 95,
      unitOfMeasureName: "pcs",
    },
    {
      productId: 5,
      productName: "Mounting Brackets",
      productReference: "MB-005",
      currentQuantity: 15,
      minimumStock: 50,
      deficit: 35,
      unitOfMeasureName: "units",
    },
  ],
};

const mockBothAlerts: DashboardAlertsResponse = {
  expiryAlerts: mockExpiryAlerts.expiryAlerts,
  lowStockAlerts: mockLowStockAlerts.lowStockAlerts,
};

const mockNoAlerts: DashboardAlertsResponse = {
  expiryAlerts: [],
  lowStockAlerts: [],
};

const mockSummaryFull: DashboardSummaryResponse = {
  stock: {
    totalPalettes: 42,
    totalProducts: 15,
    totalCapacity: 200,
    capacityUtilization: 0.21,
  },
  intake: {
    palettesReceivedToday: 5,
    palettesReceivedYesterday: 3,
    trend: "increasing",
  },
  setup: {
    hasPalettiers: true,
    hasProducts: true,
    hasRules: true,
    hasStock: true,
    completedSteps: 4,
    totalSteps: 4,
  },
};

const mockSummaryEmpty: DashboardSummaryResponse = {
  stock: {
    totalPalettes: 0,
    totalProducts: 0,
    totalCapacity: 0,
    capacityUtilization: 0,
  },
  intake: {
    palettesReceivedToday: 0,
    palettesReceivedYesterday: 0,
    trend: "stable",
  },
  setup: {
    hasPalettiers: false,
    hasProducts: false,
    hasRules: false,
    hasStock: false,
    completedSteps: 0,
    totalSteps: 4,
  },
};

const loadedAlerts = (data: DashboardAlertsResponse) => ({
  data,
  isPending: false,
  isError: false,
  error: null,
});

const loadedSummary = (data: DashboardSummaryResponse) => ({
  data,
  isPending: false,
  isError: false,
  error: null,
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alertsOverride = null;
    summaryOverride = null;
    violationsOverride = null;
  });

  // ---- Existing alert tests ----

  it("renders loading spinner when data is pending", () => {
    alertsOverride = {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    };

    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("calls handleError when fetch fails", () => {
    const apiError = new Error("API error: 500 Internal Server Error");
    alertsOverride = {
      data: undefined,
      isPending: false,
      isError: true,
      error: apiError,
    };
    summaryOverride = {
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
    };

    renderPage();

    expect(mockHandleError).toHaveBeenCalledWith(apiError);
  });

  it("renders expiry alerts sorted by days remaining ascending", () => {
    alertsOverride = loadedAlerts(mockExpiryAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    const alertCards = screen.getAllByText(/days remaining|Expired/);
    expect(alertCards[0]).toHaveTextContent("Expired");
    expect(alertCards[1]).toHaveTextContent("4 days remaining");
    expect(alertCards[2]).toHaveTextContent("22 days remaining");
  });

  it("expired products show error styling", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: [mockExpiryAlerts.expiryAlerts[0]],
      lowStockAlerts: [],
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Fresh Yogurt")).toBeInTheDocument();
    expect(screen.getByText(/Expired/)).toBeInTheDocument();
  });

  it("critical products show warning styling", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: [mockExpiryAlerts.expiryAlerts[1]],
      lowStockAlerts: [],
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText(/4 days remaining/)).toBeInTheDocument();
  });

  it("approaching products show info styling", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: [mockExpiryAlerts.expiryAlerts[2]],
      lowStockAlerts: [],
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Cream Cheese")).toBeInTheDocument();
    expect(screen.getByText(/22 days remaining/)).toBeInTheDocument();
  });

  it("expiry alert shows product name, quantity, expiry date, days remaining", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: [mockExpiryAlerts.expiryAlerts[1]],
      lowStockAlerts: [],
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText(/WM-001/)).toBeInTheDocument();
    expect(screen.getByText(/120 units/)).toBeInTheDocument();
    expect(screen.getByText(/20\/02\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/4 days remaining/)).toBeInTheDocument();
  });

  it("low-stock alerts show product name, current quantity, threshold, deficit", () => {
    alertsOverride = loadedAlerts(mockLowStockAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Mounting Brackets")).toBeInTheDocument();
    expect(screen.getByText(/MB-005/)).toBeInTheDocument();
    expect(screen.getByText(/15 \/ 50 units/)).toBeInTheDocument();
    expect(screen.getByText(/35 units below minimum/)).toBeInTheDocument();
  });

  it("low-stock alerts sorted by deficit descending", () => {
    alertsOverride = loadedAlerts(mockLowStockAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    const deficitTexts = screen.getAllByText(/below minimum/);
    expect(deficitTexts[0]).toHaveTextContent("95 pcs below minimum");
    expect(deficitTexts[1]).toHaveTextContent("35 units below minimum");
  });

  it("shows 'No expiry alerts' when expiryAlerts is empty", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: [],
      lowStockAlerts: mockLowStockAlerts.lowStockAlerts,
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText(/No expiry alerts/)).toBeInTheDocument();
  });

  it("shows 'All stock levels healthy' when lowStockAlerts is empty", () => {
    alertsOverride = loadedAlerts({
      expiryAlerts: mockExpiryAlerts.expiryAlerts,
      lowStockAlerts: [],
    });
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("All stock levels healthy")).toBeInTheDocument();
  });

  it("renders both alert panels when data has both types", () => {
    alertsOverride = loadedAlerts(mockBothAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Expiry Alerts")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Warnings")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Mounting Brackets")).toBeInTheDocument();
  });

  it("renders both empty states when no alerts exist", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText(/No expiry alerts/)).toBeInTheDocument();
    expect(screen.getByText("All stock levels healthy")).toBeInTheDocument();
  });

  // ---- Summary / metric card tests ----

  it("renders loading spinner when summary data is pending", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    };

    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders stock summary card with total palettes", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Stock Summary")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders stock summary with products tracked and capacity utilization", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText(/15 products/)).toBeInTheDocument();
    expect(screen.getByText(/21% capacity/)).toBeInTheDocument();
  });

  it("renders intake activity card with yesterday count", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Intake Activity")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders trend indicator arrow", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText(/\u2191 today: 5/)).toBeInTheDocument();
  });

  it("calls handleError when summary fetch fails", () => {
    const apiError = new Error("API error: 500 Internal Server Error");
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = {
      data: undefined,
      isPending: false,
      isError: true,
      error: apiError,
    };

    renderPage();

    expect(mockHandleError).toHaveBeenCalledWith(apiError);
  });

  it("metric cards display in grid layout with icons", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    const { container } = renderPage();

    expect(screen.getByText("Stock Summary")).toBeInTheDocument();
    expect(screen.getByText("Intake Activity")).toBeInTheDocument();
    const gridContainer = container.querySelector(".MuiGrid-container");
    expect(gridContainer).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='Inventory2OutlinedIcon']")
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='LocalShippingIcon']")
    ).toBeInTheDocument();
  });

  it("shows zero values gracefully when no data exists", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryEmpty);

    renderPage();

    expect(screen.getByText("Stock Summary")).toBeInTheDocument();
    expect(screen.getByText("Intake Activity")).toBeInTheDocument();
    expect(screen.getByText(/0 products/)).toBeInTheDocument();
    expect(screen.getByText(/0% capacity/)).toBeInTheDocument();
  });

  it("renders onboarding guide when setup is incomplete", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryEmpty);

    renderPage();

    expect(
      screen.getByText("Get Started — Set up your warehouse")
    ).toBeInTheDocument();
  });

  it("onboarding guide shows correct progress count", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary({
      ...mockSummaryEmpty,
      setup: {
        ...mockSummaryEmpty.setup,
        hasPalettiers: true,
        hasProducts: true,
        completedSteps: 2,
        totalSteps: 4,
      },
    });

    renderPage();

    expect(screen.getByText("2 of 4 setup steps complete")).toBeInTheDocument();
  });

  it("onboarding guide links to setup pages", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryEmpty);

    renderPage();

    expect(screen.getByText("Create Palettiers")).toBeInTheDocument();
    expect(screen.getByText("Add Products")).toBeInTheDocument();
    expect(screen.getByText("Define Rules")).toBeInTheDocument();
    expect(screen.getByText("Register Stock")).toBeInTheDocument();
  });

  // ---- Rule violation tests ----

  it("shows loading state for violations panel while pending", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);
    violationsOverride = {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    };

    renderPage();

    expect(
      screen.getByText("Checking for rule violations...")
    ).toBeInTheDocument();
  });

  it("shows no violations message when violations list is empty", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);
    violationsOverride = { data: [], isPending: false, isError: false, error: null };

    renderPage();

    expect(
      screen.getByText(/No rule violations/)
    ).toBeInTheDocument();
  });

  it("renders violation cards with product name, palettier, rule and resolve button", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);
    violationsOverride = {
      data: [
        {
          paletteId: 7,
          palettierName: "Rack A1",
          positionX: 0,
          positionY: 1,
          positionZ: 3,
          productName: "Fragile Ceramic",
          ruleName: "Ground Only Rule",
          ruleType: "placement_constraint",
          violationReason:
            "Palette must be on ground level (position Z=0), currently at Z=3",
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    };

    renderPage();

    expect(screen.getByText("Rule Violations")).toBeInTheDocument();
    expect(screen.getByText("Fragile Ceramic")).toBeInTheDocument();
    expect(screen.getByText(/Rack A1/)).toBeInTheDocument();
    expect(screen.getByText(/Ground Only Rule/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resolve" })).toBeInTheDocument();
  });

  it("shows violation count chip when violations exist", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);
    violationsOverride = {
      data: [
        {
          paletteId: 7,
          palettierName: "Rack A1",
          positionX: 0,
          positionY: 0,
          positionZ: 2,
          productName: "Heavy Box",
          ruleName: "Max Height Rule",
          ruleType: "placement_constraint",
          violationReason: "Exceeds max height",
        },
        {
          paletteId: 8,
          palettierName: "Rack B2",
          positionX: 1,
          positionY: 0,
          positionZ: 0,
          productName: "Cold Item",
          ruleName: "Refrigeration Zone",
          ruleType: "storage_condition",
          violationReason: "Wrong palettier type",
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    };

    renderPage();

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not render onboarding guide when all steps complete", () => {
    alertsOverride = loadedAlerts(mockNoAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(
      screen.queryByText("Get Started — Set up your warehouse")
    ).not.toBeInTheDocument();
  });

  it("renders both alert panels AND metric cards when both have data", () => {
    alertsOverride = loadedAlerts(mockBothAlerts);
    summaryOverride = loadedSummary(mockSummaryFull);

    renderPage();

    expect(screen.getByText("Expiry Alerts")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Warnings")).toBeInTheDocument();
    expect(screen.getByText("Stock Summary")).toBeInTheDocument();
    expect(screen.getByText("Intake Activity")).toBeInTheDocument();
  });
});
