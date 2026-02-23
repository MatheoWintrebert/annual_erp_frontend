import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StockPage from "./StockPage";
import type { PaletteListItem, RuleViolation } from "./types";

const mockShowSnackbar = vi.fn();

vi.mock("../../components/ui/SnackbarProvider", () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
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

const mockPalettes: PaletteListItem[] = [
  {
    id: 1,
    palettierId: 10,
    palettierName: "Cold Storage A",
    positionX: 1,
    positionY: 2,
    positionZ: 0,
    receivedAt: "2026-02-10T08:30:00.000Z",
    items: [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        lotReference: "LOT-2026-0842",
        quantity: 40,
        expiryDate: "2026-03-15T00:00:00.000Z",
        unitOfMeasureName: "units",
      },
    ],
  },
  {
    id: 2,
    palettierId: 11,
    palettierName: "Dry Storage B",
    positionX: 0,
    positionY: 0,
    positionZ: 1,
    receivedAt: "2026-02-08T14:00:00.000Z",
    items: [
      {
        productId: 2,
        productName: "Organic Flour",
        productReference: "OF-010",
        lotReference: "LOT-2026-0900",
        quantity: 25,
        expiryDate: null,
        unitOfMeasureName: "bags",
      },
    ],
  },
];

const mockMultiProductPalette: PaletteListItem[] = [
  {
    id: 3,
    palettierId: 10,
    palettierName: "Cold Storage A",
    positionX: 2,
    positionY: 1,
    positionZ: 0,
    receivedAt: "2026-02-09T10:00:00.000Z",
    items: [
      {
        productId: 1,
        productName: "Whole Milk",
        productReference: "WM-001",
        lotReference: "LOT-2026-0843",
        quantity: 30,
        expiryDate: "2026-03-20T00:00:00.000Z",
        unitOfMeasureName: "units",
      },
      {
        productId: 3,
        productName: "Butter",
        productReference: "BT-005",
        lotReference: "LOT-2026-0844",
        quantity: 15,
        expiryDate: "2026-04-01T00:00:00.000Z",
        unitOfMeasureName: "units",
      },
    ],
  },
];

const mockPalettiers = [
  { id: 10, name: "Cold Storage A" },
  { id: 11, name: "Dry Storage B" },
];

let palettesOverride: {
  data: PaletteListItem[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} | null = null;

let violationsOverride: {
  data: RuleViolation[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
} | null = null;

const mockViolations: RuleViolation[] = [
  {
    paletteId: 1,
    palettierName: "Cold Storage A",
    positionX: 1,
    positionY: 2,
    positionZ: 0,
    productName: "Whole Milk",
    ruleName: "Ground Only",
    ruleType: "placement_constraint",
    violationReason: "Palette must be on ground level",
  },
];

const mockUseGetPalettes = vi.fn();
const mockMutateAsync = vi.fn();
const mockCheckViolationsMutateAsync = vi.fn().mockResolvedValue([]);
const mockRegisterOnboardingMutateAsync = vi.fn().mockResolvedValue({
  paletteId: 99,
  palettierId: 10,
  palettierName: "Cold Storage A",
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  createdAt: "2026-02-13T10:00:00.000Z",
  items: [],
});

const mockProductsResponse = {
  products: [
    { id: 1, name: "Whole Milk", reference: "WM-001", unitOfMeasureId: 1 },
    { id: 2, name: "Organic Flour", reference: "OF-010", unitOfMeasureId: 2 },
  ],
  meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
};

const mockUnitsOfMeasureResponse = {
  unitsOfMeasure: [
    { id: 1, name: "units" },
    { id: 2, name: "bags" },
  ],
  meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
};

vi.mock("./api", () => ({
  useGetPalettes: (...args: unknown[]) => {
    mockUseGetPalettes(...args);
    return (
      palettesOverride ?? {
        data: mockPalettes,
        isPending: false,
        isError: false,
        error: null,
      }
    );
  },
  useGetPaletteViolations: () =>
    violationsOverride ?? {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    },
  useGetPalettiers: () => ({
    data: mockPalettiers,
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdatePalettePosition: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useGetProductsForOnboarding: () => ({
    data: mockProductsResponse,
    isPending: false,
  }),
  useGetUnitsOfMeasure: () => ({
    data: mockUnitsOfMeasureResponse,
    isPending: false,
  }),
  useCheckPlacementViolations: () => ({
    mutateAsync: mockCheckViolationsMutateAsync,
    isPending: false,
  }),
  useRegisterOnboardingPalette: () => ({
    mutateAsync: mockRegisterOnboardingMutateAsync,
    isPending: false,
  }),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderPage = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={["/stock"]}>
        <StockPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("StockPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    palettesOverride = null;
    violationsOverride = null;
  });

  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("Stock Overview")).toBeInTheDocument();
  });

  it("renders table with palette data", () => {
    renderPage();
    expect(screen.getByText("Cold Storage A")).toBeInTheDocument();
    expect(screen.getByText("Dry Storage B")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Organic Flour")).toBeInTheDocument();
    expect(screen.getByText("WM-001")).toBeInTheDocument();
    expect(screen.getByText("OF-010")).toBeInTheDocument();
    expect(screen.getByText("40 units")).toBeInTheDocument();
    expect(screen.getByText("25 bags")).toBeInTheDocument();
    expect(screen.getByText("LOT-2026-0842")).toBeInTheDocument();
    expect(screen.getByText("LOT-2026-0900")).toBeInTheDocument();
  });

  it("renders position formatted correctly", () => {
    renderPage();
    expect(screen.getByText("1-2-0")).toBeInTheDocument();
    expect(screen.getByText("0-0-1")).toBeInTheDocument();
  });

  it("shows dash for null expiry date", () => {
    renderPage();
    const rows = screen.getAllByRole("row");
    // Find the Organic Flour row (null expiry)
    const flourRow = rows.find((row) =>
      within(row).queryByText("Organic Flour")
    );
    expect(flourRow).toBeDefined();
    if (flourRow) {
      expect(within(flourRow).getByText("\u2014")).toBeInTheDocument();
    }
  });

  it("sort by palettier name toggles ascending/descending", async () => {
    const user = userEvent.setup();
    renderPage();

    // Find the sort label in the table header (not the filter label)
    const table = screen.getByRole("table");
    const headerRow = within(table).getAllByRole("row")[0];
    const palettierSortButton = within(headerRow).getByText("Palettier");

    // Click "Palettier" header to sort ascending
    await user.click(palettierSortButton);

    const rowsAfterAsc = screen.getAllByRole("row");
    // First data row (index 1) should be Cold Storage A (alphabetically first)
    expect(within(rowsAfterAsc[1]).getByText("Cold Storage A")).toBeInTheDocument();

    // Click again for descending
    await user.click(palettierSortButton);

    const rowsAfterDesc = screen.getAllByRole("row");
    expect(within(rowsAfterDesc[1]).getByText("Dry Storage B")).toBeInTheDocument();
  });

  it("sort by product name works", async () => {
    const user = userEvent.setup();
    renderPage();

    // Click "Product" header
    await user.click(screen.getByText("Product"));

    const rowsAfterAsc = screen.getAllByRole("row");
    // Organic Flour comes before Whole Milk alphabetically
    expect(within(rowsAfterAsc[1]).getByText("Organic Flour")).toBeInTheDocument();
    expect(within(rowsAfterAsc[2]).getByText("Whole Milk")).toBeInTheDocument();
  });

  it("sort by expiry date works", async () => {
    const user = userEvent.setup();
    renderPage();

    // Click "Expiry" header to sort ascending
    await user.click(screen.getByText("Expiry"));

    const rows = screen.getAllByRole("row");
    // null expiry goes to end, so Whole Milk (2026-03-15) should come first
    expect(within(rows[1]).getByText("Whole Milk")).toBeInTheDocument();
  });

  it("sort by received date works", async () => {
    const user = userEvent.setup();
    renderPage();

    // Default is receivedAt DESC, so Cold Storage A (Feb 10) should be first
    const defaultRows = screen.getAllByRole("row");
    expect(within(defaultRows[1]).getByText("Cold Storage A")).toBeInTheDocument();

    // Click "Received" to toggle to ascending (already active field, so toggles direction)
    await user.click(screen.getByText("Received"));

    // Now ascending, so Dry Storage B (Feb 8) should be first
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Dry Storage B")).toBeInTheDocument();
  });

  it("filter by palettier passes palettierId to API hook", async () => {
    const user = userEvent.setup();
    renderPage();

    // Open the Autocomplete
    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);

    // Select "Cold Storage A"
    const option = await screen.findByText("Cold Storage A", {
      selector: '[role="option"]',
    });
    await user.click(option);

    expect(palettierInput).toHaveValue("Cold Storage A");

    // Verify the API hook is called with the correct palettier filter
    await waitFor(() => {
      expect(mockUseGetPalettes).toHaveBeenCalledWith(
        expect.objectContaining({ palettierId: 10 })
      );
    });
  });

  it("filter by product name passes search to API hook", async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByLabelText("Search product");
    await user.type(searchInput, "Milk");

    expect(searchInput).toHaveValue("Milk");

    // Verify the API hook is called with the search param after debounce
    await waitFor(() => {
      expect(mockUseGetPalettes).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Milk" })
      );
    });
  });

  it("empty state shown when no palettes and no filters", () => {
    palettesOverride = {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    };
    renderPage();

    expect(
      screen.getByText("No palettes in the warehouse yet")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Register palettes through Intake or onboard your existing stock"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to intake/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /onboard existing stock/i })
    ).toBeEnabled();
  });

  it('"No palettes match" message when filtered result is empty', async () => {
    const user = userEvent.setup();
    palettesOverride = {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    };
    renderPage();

    // Type in search to activate filters
    const searchInput = screen.getByLabelText("Search product");
    await user.type(searchInput, "xyz");

    // Wait for debounce + filter state update
    await waitFor(() => {
      expect(
        screen.getByText("No palettes match your filters")
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText("No palettes in the warehouse yet")
    ).not.toBeInTheDocument();
  });

  it("loading spinner shown while isPending", () => {
    palettesOverride = {
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    };
    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("multi-product palette shows multiple rows", () => {
    palettesOverride = {
      data: mockMultiProductPalette,
      isPending: false,
      isError: false,
      error: null,
    };
    renderPage();

    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Butter")).toBeInTheDocument();
    expect(screen.getByText("30 units")).toBeInTheDocument();
    expect(screen.getByText("15 units")).toBeInTheDocument();

    // Both rows should have the same palettier
    const coldStorageCells = screen.getAllByText("Cold Storage A");
    expect(coldStorageCells.length).toBeGreaterThanOrEqual(2);
  });

  it("calls handleError when API returns an error", () => {
    const mockError = new Error("Network error");
    palettesOverride = {
      data: undefined,
      isPending: false,
      isError: true,
      error: mockError,
    };
    renderPage();

    expect(mockHandleError).toHaveBeenCalledWith(mockError);
  });

  it("shows clear filters button when palettier filter is active", async () => {
    const user = userEvent.setup();
    renderPage();

    // Initially no clear button
    expect(
      screen.queryByRole("button", { name: /clear filters/i })
    ).not.toBeInTheDocument();

    // Select a palettier
    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);
    const option = await screen.findByText("Cold Storage A", {
      selector: '[role="option"]',
    });
    await user.click(option);

    // Clear filters button should appear
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  it("edit button is visible on each palette row", () => {
    renderPage();
    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    // 2 palettes = 2 edit buttons
    expect(editButtons).toHaveLength(2);
  });

  it("clicking edit button opens position edit dialog with pre-filled values", async () => {
    const user = userEvent.setup();
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    await user.click(editButtons[0]);

    // Dialog should be open
    expect(screen.getByText("Edit Palette Position")).toBeInTheDocument();

    // Palettier should be pre-filled with the palette's current palettier
    const dialog = screen.getByRole("dialog");
    const palettierInput = within(dialog).getByLabelText("Palettier");
    expect(palettierInput).toHaveValue("Cold Storage A");

    // Position fields should be pre-filled with palette 1's values (1, 2, 0)
    const posXInput = screen.getByLabelText("Position X");
    const posYInput = screen.getByLabelText("Position Y");
    const posZInput = screen.getByLabelText("Position Z");
    expect(posXInput).toHaveValue(1);
    expect(posYInput).toHaveValue(2);
    expect(posZInput).toHaveValue(0);
  });

  it("dialog shows palettier autocomplete and position fields", async () => {
    const user = userEvent.setup();
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    await user.click(editButtons[0]);

    expect(screen.getByText("Edit Palette Position")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Palettier")).toBeInTheDocument();
    expect(screen.getByLabelText("Position X")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Y")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Z")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("cancel closes dialog without changes", async () => {
    const user = userEvent.setup();
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    await user.click(editButtons[0]);

    // Dialog is open
    expect(screen.getByText("Edit Palette Position")).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Dialog should be closed (wait for exit animation)
    await waitFor(() => {
      expect(
        screen.queryByText("Edit Palette Position")
      ).not.toBeInTheDocument();
    });

    // No mutation called
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("successful save shows success Snackbar message", async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    await user.click(editButtons[0]);

    // Click Save
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          paletteId: 1,
          palettierId: 10,
          positionX: 1,
          positionY: 2,
          positionZ: 0,
        })
      );
    });

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        "Palette position updated",
        "success"
      );
    });
  });

  it("API error shows error notification", async () => {
    const mockErrorResponse = new Response(
      JSON.stringify({
        statusCode: 409,
        code: "POSITION_OCCUPIED",
        message: "Position is already occupied",
        details: {},
      }),
      { status: 409 }
    );
    mockMutateAsync.mockRejectedValue(mockErrorResponse);
    const user = userEvent.setup();
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    await user.click(editButtons[0]);

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it("multi-product palette shows edit button only on first row", () => {
    palettesOverride = {
      data: mockMultiProductPalette,
      isPending: false,
      isError: false,
      error: null,
    };
    renderPage();

    // Multi-product palette has 2 rows but should only have 1 edit button
    const editButtons = screen.getAllByRole("button", {
      name: /edit position/i,
    });
    expect(editButtons).toHaveLength(1);

    // Both rows should be visible
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Butter")).toBeInTheDocument();
  });

  // ── Onboarding tests ──

  it('"Add Existing Stock" button visible on Stock page with data', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /add existing stock/i })
    ).toBeInTheDocument();
  });

  it('clicking "Add Existing Stock" shows onboarding wizard', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    expect(screen.getByText("Onboard Existing Stock")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Place")).toBeInTheDocument();
  });

  it('"Onboard Existing Stock" button in empty state triggers onboarding wizard', async () => {
    palettesOverride = {
      data: [],
      isPending: false,
      isError: false,
      error: null,
    };
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /onboard existing stock/i })
    );

    expect(screen.getByText("Onboard Existing Stock")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("onboarding wizard shows 3 steps: Products, Review, Place", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Place")).toBeInTheDocument();
  });

  it("can add a product in Step 1", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Open product autocomplete
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);

    // Select "Whole Milk"
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);

    // Fill in quantity
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "40");

    // Click "Add to palette"
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );

    // Product should appear in the list
    expect(screen.getByText(/WM-001 — Whole Milk/)).toBeInTheDocument();
    expect(screen.getByText("40 units")).toBeInTheDocument();
  });

  it("review step shows product summary", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add a product
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "25");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );

    // Go to review step
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Review step should show product summary
    expect(screen.getByText("Review products")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("WM-001")).toBeInTheDocument();
    expect(screen.getByText("Total: 1 product")).toBeInTheDocument();
  });

  it("placement step shows palettier autocomplete and position fields", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add a product and go to placement step
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "10");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );

    // Step 1 → Step 2
    await user.click(screen.getByRole("button", { name: /next/i }));
    // Step 2 → Step 3
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      screen.getByText("Specify current placement")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Palettier")).toBeInTheDocument();
    expect(screen.getByLabelText("Position X")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Y")).toBeInTheDocument();
    expect(screen.getByLabelText("Position Z")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register palette/i })
    ).toBeInTheDocument();
  });

  it("successful onboarding shows success message and Add Another button", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add product
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "20");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );

    // Navigate to placement step
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Select palettier
    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);
    const palettierOption = await screen.findByText("Cold Storage A", {
      selector: '[role="option"]',
    });
    await user.click(palettierOption);

    // Confirm
    await user.click(
      screen.getByRole("button", { name: /register palette/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Palette onboarded successfully")
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /add another/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /back to stock/i })
    ).toBeInTheDocument();
  });

  it('"Add Another" resets wizard to Step 1', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add product, navigate, confirm
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "20");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);
    const palettierOption = await screen.findByText("Cold Storage A", {
      selector: '[role="option"]',
    });
    await user.click(palettierOption);

    await user.click(
      screen.getByRole("button", { name: /register palette/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Palette onboarded successfully")
      ).toBeInTheDocument();
    });

    // Click "Add Another"
    await user.click(
      screen.getByRole("button", { name: /add another/i })
    );

    // Should be back on Step 1
    expect(
      screen.getByText("Add products to this palette")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Product")).toBeInTheDocument();
  });

  it('"Back to Stock" returns to stock list view', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add product, navigate, confirm
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "20");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);
    const palettierOption = await screen.findByText("Cold Storage A", {
      selector: '[role="option"]',
    });
    await user.click(palettierOption);

    await user.click(
      screen.getByRole("button", { name: /register palette/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Palette onboarded successfully")
      ).toBeInTheDocument();
    });

    // Click "Back to Stock"
    await user.click(
      screen.getByRole("button", { name: /back to stock/i })
    );

    // Should be back on stock list
    expect(screen.getByText("Stock Overview")).toBeInTheDocument();
  });

  // ── Rule Violation Warnings View tests (Story 3.4) ──

  it("violation summary hidden when no violations", () => {
    renderPage();
    expect(
      screen.queryByText(/palette\(s\) with .* rule violation\(s\)/)
    ).not.toBeInTheDocument();
  });

  it("violation summary shows count when violations exist", () => {
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();
    expect(
      screen.getByText("1 palette(s) with 1 rule violation(s)")
    ).toBeInTheDocument();
  });

  it("violation chip shown on violated palette row", () => {
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();
    expect(screen.getByText("1 violation(s)")).toBeInTheDocument();
  });

  it("clicking violation chip opens ViolationAlertDialog with details", async () => {
    const user = userEvent.setup();
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();

    await user.click(screen.getByText("1 violation(s)"));

    expect(
      screen.getByText("Rule Violations Detected")
    ).toBeInTheDocument();
    expect(screen.getByText("Ground Only")).toBeInTheDocument();
    expect(
      screen.getByText("Palette must be on ground level")
    ).toBeInTheDocument();
  });

  it("ViolationAlertDialog shows calm info alert and corrective action message", async () => {
    const user = userEvent.setup();
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();

    await user.click(screen.getByText("1 violation(s)"));

    expect(
      screen.getByText(/Consider re-intaking these palettes for compliant placement/)
    ).toBeInTheDocument();
  });

  it('"Violations only" filter checkbox visible in filters', () => {
    renderPage();
    expect(screen.getByLabelText("Violations only")).toBeInTheDocument();
  });

  it('"Violations only" filter shows only violated palettes', async () => {
    const user = userEvent.setup();
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();

    // Both palettes visible initially
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Organic Flour")).toBeInTheDocument();

    // Enable violations filter
    await user.click(screen.getByLabelText("Violations only"));

    // Only violated palette (id: 1, Cold Storage A with Whole Milk) should be visible
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.queryByText("Organic Flour")).not.toBeInTheDocument();
  });

  it('"Clear filters" also clears violations filter', async () => {
    const user = userEvent.setup();
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();

    // Enable violations filter
    await user.click(screen.getByLabelText("Violations only"));

    // Only violated palette visible
    expect(screen.queryByText("Organic Flour")).not.toBeInTheDocument();

    // Click Clear filters
    await user.click(
      screen.getByRole("button", { name: /clear filters/i })
    );

    // Both palettes visible again
    await waitFor(() => {
      expect(screen.getByText("Organic Flour")).toBeInTheDocument();
    });
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
  });

  it("calls handleError when violations API returns an error", () => {
    const mockViolationsError = new Error("Violations fetch failed");
    violationsOverride = {
      data: undefined,
      isPending: false,
      isError: true,
      error: mockViolationsError,
    };
    renderPage();

    expect(mockHandleError).toHaveBeenCalledWith(mockViolationsError);
  });

  it("violation indicator not shown on non-violated palette rows", () => {
    violationsOverride = { data: mockViolations, isPending: false, isError: false, error: null };
    renderPage();

    // Only palette 1 has violations — only 1 chip in the table
    const table = screen.getByRole("table");
    const chipsInTable = within(table).getAllByText(/violation\(s\)/);
    expect(chipsInTable).toHaveLength(1);
  });

  // ── Onboarding violation warnings tests (Story 3.3) ──

  it("violation warnings shown when violations detected", async () => {
    mockCheckViolationsMutateAsync.mockResolvedValue([
      {
        ruleName: "Cold Storage Required",
        ruleType: "STORAGE_CONDITION",
        reason: "Product requires cold storage but palettier is dry storage",
      },
    ]);

    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /add existing stock/i })
    );

    // Add product
    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    const option = await screen.findByText("WM-001 — Whole Milk", {
      selector: '[role="option"]',
    });
    await user.click(option);
    const quantityInput = screen.getByLabelText("Quantity");
    await user.type(quantityInput, "10");
    await user.click(
      screen.getByRole("button", { name: /add to palette/i })
    );

    // Navigate to placement step
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Select palettier to trigger violation check
    const palettierInput = screen.getByLabelText("Palettier");
    await user.click(palettierInput);
    const palettierOption = await screen.findByText("Dry Storage B", {
      selector: '[role="option"]',
    });
    await user.click(palettierOption);

    // Violation warning should appear
    await waitFor(() => {
      expect(
        screen.getByText("Placement rule warnings")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Cold Storage Required:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Product requires cold storage but palettier is dry storage"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/advisory only/)
    ).toBeInTheDocument();
  });
});
