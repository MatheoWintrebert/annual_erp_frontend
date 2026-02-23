import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import IntakePage from "./IntakePage";
import type {
  ConflictPlacementResult,
  PlacementRecommendation,
  ProductsListResponse,
  ResolvedPlacementResult,
  UnitsOfMeasureListResponse,
} from "./types";

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

vi.mock("../../hooks/useApiError", () => ({
  useApiError: () => ({
    handleError: vi.fn(),
    handleResponseError: vi.fn(),
  }),
}));

const mockProductsResponse: ProductsListResponse = {
  products: [
    { id: 1, name: "Organic Flour", reference: "REF-001", unitOfMeasureId: 1 },
    { id: 2, name: "White Sugar", reference: "REF-002", unitOfMeasureId: 2 },
  ],
  meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
};

const mockUnitsResponse: UnitsOfMeasureListResponse = {
  unitsOfMeasure: [
    { id: 1, name: "Kilogram" },
    { id: 2, name: "Litre" },
  ],
  meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
};

const mockRecommendation: PlacementRecommendation = {
  palettierId: 1,
  palettierName: "Cold Storage A",
  positionX: 0,
  positionY: 1,
  positionZ: 0,
  reasoning: "Cold storage — space available",
};

const mockResolvedResult: ResolvedPlacementResult = {
  status: "resolved",
  recommendation: mockRecommendation,
};

const mockConflictResult: ConflictPlacementResult = {
  status: "conflict",
  conflictExplanation:
    "Organic Flour needs cold storage, White Sugar needs dry storage",
  groups: [
    {
      productIds: [1],
      productNames: ["Organic Flour"],
      recommendation: {
        palettierId: 1,
        palettierName: "Cold Storage A",
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        reasoning: "Cold storage — space available",
      },
      reasoning: "Cold storage — space available",
    },
    {
      productIds: [2],
      productNames: ["White Sugar"],
      recommendation: {
        palettierId: 2,
        palettierName: "Dry Storage B",
        positionX: 1,
        positionY: 0,
        positionZ: 0,
        reasoning: "Dry storage — space available",
      },
      reasoning: "Dry storage — space available",
    },
  ],
};

const mockRecommendMutateAsync = vi.fn().mockResolvedValue(mockResolvedResult);
const mockRegisterConflictMutateAsync = vi.fn().mockResolvedValue({
  palettes: [],
});
const mockRegisterMutateAsync = vi.fn().mockResolvedValue({
  paletteId: 1,
  palettierId: 1,
  palettierName: "Cold Storage A",
  positionX: 0,
  positionY: 1,
  positionZ: 0,
  items: [
    {
      lotId: 1,
      lotReference: "LOT-20260209-0001",
      productId: 1,
      productName: "Organic Flour",
      quantity: 50,
      expiryDate: null,
    },
  ],
  createdAt: "2026-02-09T10:00:00.000Z",
});

vi.mock("./api", () => ({
  useGetProductsForIntake: () => ({
    data: mockProductsResponse,
    isLoading: false,
    error: null,
  }),
  useGetUnitsOfMeasure: () => ({
    data: mockUnitsResponse,
    isLoading: false,
    error: null,
  }),
  useGetPalettiers: () => ({
    data: [
      { id: 1, name: "Cold Storage A", width: 5, depth: 3, height: 4 },
      { id: 2, name: "Dry Storage B", width: 5, depth: 3, height: 4 },
    ],
    isLoading: false,
    error: null,
  }),
  useRecommendPlacement: () => ({
    mutateAsync: mockRecommendMutateAsync,
    isPending: false,
  }),
  useRegisterPalette: () => ({
    mutateAsync: mockRegisterMutateAsync,
    isPending: false,
  }),
  useRegisterConflictResolution: () => ({
    mutateAsync: mockRegisterConflictMutateAsync,
    isPending: false,
  }),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderPage = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={["/intake"]}>
        <Routes>
          <Route path="/intake" element={<IntakePage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("IntakePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with Step 1 (product entry) visible", () => {
    renderPage();

    expect(screen.getByText("Palette Intake")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Next: Review")).toBeInTheDocument();
  });

  it("should show Products, Review, and Place step labels", () => {
    renderPage();

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Place")).toBeInTheDocument();
  });

  it("should show product autocomplete with options", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);

    expect(screen.getByText("REF-001 — Organic Flour")).toBeInTheDocument();
    expect(screen.getByText("REF-002 — White Sugar")).toBeInTheDocument();
  });

  it("should show 'Add another product' button", () => {
    renderPage();

    expect(screen.getByText("Add another product")).toBeInTheDocument();
  });

  it("should show auto-generated lot reference by default", () => {
    renderPage();

    expect(
      screen.getByDisplayValue("Auto-generated on registration")
    ).toBeInTheDocument();
  });

  it("should toggle manual lot entry", async () => {
    const user = userEvent.setup();
    renderPage();

    const toggle = screen.getByLabelText("Enter lot number manually");
    await user.click(toggle);

    expect(screen.getByLabelText("Lot Number")).toBeEnabled();
  });

  it("should navigate to Review step after filling form and clicking Next", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));

    expect(screen.getByText("Review Intake Details")).toBeInTheDocument();
    expect(screen.getByText("REF-001 — Organic Flour")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Kilogram")).toBeInTheDocument();
    expect(screen.getByText("Total Products: 1")).toBeInTheDocument();
  });

  it("should call recommend-placement with productIds array on Submit", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(mockRecommendMutateAsync).toHaveBeenCalledWith({
      productIds: [1],
    });
  });

  it("should show directive card with recommendation after Submit", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(
      screen.getByText("Place in: Cold Storage A, Position (0, 1, 0)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cold storage — space available")
    ).toBeInTheDocument();
  });

  it("should call register-palette on Done, show success, and navigate home", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));
    await user.click(screen.getByText("Done"));

    expect(mockRegisterMutateAsync).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Palette registered successfully",
      "success"
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should call register-palette on Register Another and reset form", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));
    await user.click(screen.getByText("Register Another"));

    expect(mockRegisterMutateAsync).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Palette registered successfully",
      "success"
    );

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Next: Review")).toBeInTheDocument();
  });

  it("should add a second product row when clicking 'Add another product'", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();

    await user.click(screen.getByText("Add another product"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("should remove a product row when clicking the remove button", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Add another product"));
    expect(screen.getByText("Product 2")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove product 2"));

    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });

  it("should disable the remove button when only one product exists", () => {
    renderPage();

    const removeButton = screen.getByLabelText("Remove product 1");
    expect(removeButton).toBeDisabled();
  });

  it("should show multi-product review table with correct totals", async () => {
    const user = userEvent.setup();
    renderPage();

    // Fill first product
    const firstProduct = screen.getByLabelText("Product");
    await user.click(firstProduct);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const firstQuantity = screen.getByLabelText("Quantity");
    await user.clear(firstQuantity);
    await user.type(firstQuantity, "50");

    // Add second product
    await user.click(screen.getByText("Add another product"));

    // Fill second product - wait for card to render, then get inputs
    const card2 = (await screen.findByText("Product 2")).closest(
      ".MuiCard-root"
    );
    if (!card2 || !(card2 instanceof HTMLElement))
      throw new Error("Card 2 not found");

    const product2Input = within(card2).getByLabelText("Product");
    await user.click(product2Input);
    await user.click(await screen.findByText("REF-002 — White Sugar"));

    const quantity2Input = within(card2).getByLabelText("Quantity");
    await user.clear(quantity2Input);
    await user.type(quantity2Input, "30");

    // Go to review
    await user.click(screen.getByText("Next: Review"));

    expect(screen.getByText("Review Intake Details")).toBeInTheDocument();
    expect(screen.getByText("REF-001 — Organic Flour")).toBeInTheDocument();
    expect(screen.getByText("REF-002 — White Sugar")).toBeInTheDocument();
    expect(screen.getByText("Total Products: 2")).toBeInTheDocument();
  }, 15000);

  it("should send multiple productIds in recommend-placement call", async () => {
    const user = userEvent.setup();
    renderPage();

    // Fill first product
    const firstProduct = screen.getByLabelText("Product");
    await user.click(firstProduct);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const firstQuantity = screen.getByLabelText("Quantity");
    await user.clear(firstQuantity);
    await user.type(firstQuantity, "50");

    // Add second product
    await user.click(screen.getByText("Add another product"));

    const card2El = (await screen.findByText("Product 2")).closest(
      ".MuiCard-root"
    );
    if (!card2El || !(card2El instanceof HTMLElement))
      throw new Error("Card 2 not found");
    const product2Input = within(card2El).getByLabelText("Product");
    await user.click(product2Input);
    await user.click(await screen.findByText("REF-002 — White Sugar"));

    const quantity2Input = within(card2El).getByLabelText("Quantity");
    await user.clear(quantity2Input);
    await user.type(quantity2Input, "30");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(mockRecommendMutateAsync).toHaveBeenCalledWith({
      productIds: [1, 2],
    });
  }, 15000);

  it("should preserve product entries when going back from Review", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    expect(screen.getByText("Review Intake Details")).toBeInTheDocument();

    await user.click(screen.getByText("Back"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Next: Review")).toBeInTheDocument();
  });

  it("should show validation error when submitting without selecting a product", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Next: Review"));

    // Should NOT navigate to review — form is invalid
    expect(screen.queryByText("Review Intake Details")).not.toBeInTheDocument();
    // Should show validation error
    expect(screen.getByText("Product is required")).toBeInTheDocument();
  });

  it("should show ConflictResolutionStep when recommend returns conflict", async () => {
    mockRecommendMutateAsync.mockResolvedValueOnce(mockConflictResult);

    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(
      screen.getByText(
        "Organic Flour needs cold storage, White Sugar needs dry storage"
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Group 1/)).toBeInTheDocument();
    expect(screen.getByText(/Group 2/)).toBeInTheDocument();
    expect(screen.getByText("Back to Products")).toBeInTheDocument();
    expect(screen.getByText("Confirm All Placements")).toBeInTheDocument();
  });

  it("should show PlacementStep (not ConflictResolutionStep) when recommend returns resolved", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(
      screen.getByText("Place in: Cold Storage A, Position (0, 1, 0)")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Confirm All Placements")
    ).not.toBeInTheDocument();
  });

  it("should return to Step 1 with data preserved when clicking Back to Products in conflict view", async () => {
    mockRecommendMutateAsync.mockResolvedValueOnce(mockConflictResult);

    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("REF-001 — Organic Flour"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "50");

    await user.click(screen.getByText("Next: Review"));
    await user.click(screen.getByText("Submit"));

    expect(screen.getByText("Back to Products")).toBeInTheDocument();
    await user.click(screen.getByText("Back to Products"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Next: Review")).toBeInTheDocument();
  });
});
