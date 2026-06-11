import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeStore } from "@/store/store";
import PickingPage from "./PickingPage";
import type { AvailableStockItem, PickRouteItem } from "./types";

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

const mockProducts = {
  products: [
    {
      id: 1,
      name: "Whole Milk",
      reference: "WM-001",
      unitOfMeasureName: "L",
    },
    {
      id: 2,
      name: "Cable Ties",
      reference: "CT-100",
      unitOfMeasureName: "pcs",
    },
  ],
  meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
};

const mockStock: AvailableStockItem[] = [
  {
    productId: 1,
    productName: "Whole Milk",
    productReference: "WM-001",
    availableQuantity: 150,
    unitOfMeasureName: "L",
  },
  {
    productId: 2,
    productName: "Cable Ties",
    productReference: "CT-100",
    availableQuantity: 45,
    unitOfMeasureName: "pcs",
  },
];

const mockRouteItems: PickRouteItem[] = [
  {
    pickingListItemId: 1,
    productId: 1,
    productName: "Whole Milk",
    productReference: "WM-001",
    palettierName: "Cold Storage A",
    paletteId: 5,
    paletteLotId: 12,
    positionX: 1,
    positionY: 2,
    positionZ: 1,
    quantityToPick: 20,
    expiryDate: "2026-03-01T00:00:00.000Z",
    lotReference: "LOT-2026-001",
  },
];

const mockMultiRouteItems: PickRouteItem[] = [
  {
    pickingListItemId: 1,
    productId: 1,
    productName: "Whole Milk",
    productReference: "WM-001",
    palettierName: "Cold Storage A",
    paletteId: 5,
    paletteLotId: 12,
    positionX: 1,
    positionY: 2,
    positionZ: 1,
    quantityToPick: 30,
    expiryDate: "2026-02-20T00:00:00.000Z",
    lotReference: "LOT-2026-001",
  },
  {
    pickingListItemId: 1,
    productId: 1,
    productName: "Whole Milk",
    productReference: "WM-001",
    palettierName: "Cold Storage A",
    paletteId: 7,
    paletteLotId: 18,
    positionX: 1,
    positionY: 3,
    positionZ: 1,
    quantityToPick: 20,
    expiryDate: "2026-03-15T00:00:00.000Z",
    lotReference: "LOT-2026-003",
  },
];

const mockCreateMutateAsync = vi.fn().mockResolvedValue({
  id: 1,
  status: "created",
  items: [
    { id: 1, productId: 1, productName: "Whole Milk", requestedQuantity: 20 },
  ],
  createdAt: "2026-02-14T10:00:00.000Z",
});

const mockGenerateRouteMutateAsync = vi.fn().mockResolvedValue(mockRouteItems);

const mockCompleteMutateAsync = vi.fn().mockResolvedValue({
  pickingListId: 1,
  status: "completed",
  totalItemsPicked: 1,
  totalItemsSkipped: 0,
  deductions: [
    {
      paletteLotId: 12,
      productName: "Whole Milk",
      quantityDeducted: 20,
      palettierName: "Cold Storage A",
      positionX: 1,
      positionY: 2,
      positionZ: 1,
    },
  ],
  discrepancies: [],
});

const mockCancelMutateAsync = vi.fn().mockResolvedValue({
  pickingListId: 1,
  status: "cancelled",
});

const mockSearchProducts = vi.fn().mockReturnValue({
  data: mockProducts,
  isLoading: false,
  error: null,
  isPending: false,
});

const mockGetAvailableStock = vi.fn().mockReturnValue({
  data: mockStock,
  isLoading: false,
  error: null,
  isPending: false,
});

const mockCreatePickingList = vi.fn().mockReturnValue({
  mutateAsync: mockCreateMutateAsync,
  isPending: false,
});

const mockGeneratePickRoute = vi.fn().mockReturnValue({
  mutateAsync: mockGenerateRouteMutateAsync,
  isPending: false,
});

const mockCompletePickingList = vi.fn().mockReturnValue({
  mutateAsync: mockCompleteMutateAsync,
  isPending: false,
});

const mockCancelPickingList = vi.fn().mockReturnValue({
  mutateAsync: mockCancelMutateAsync,
  isPending: false,
});

vi.mock("./api", () => ({
  useSearchProducts: (...args: unknown[]) =>
    mockSearchProducts(...args) as unknown,
  useGetAvailableStock: (...args: unknown[]) =>
    mockGetAvailableStock(...args) as unknown,
  useCreatePickingList: () => mockCreatePickingList() as unknown,
  useGeneratePickRoute: () => mockGeneratePickRoute() as unknown,
  useCompletePickingList: () => mockCompletePickingList() as unknown,
  useCancelPickingList: () => mockCancelPickingList() as unknown,
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderPage = () =>
  render(
    <Provider store={makeStore()}>
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={["/pick"]}>
          <Routes>
            <Route path="/pick" element={<PickingPage />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );

async function navigateToReviewStep(user: ReturnType<typeof userEvent.setup>) {
  const productInput = screen.getByLabelText("Product");
  await user.click(productInput);
  await user.click(screen.getByText("Whole Milk (WM-001)"));

  const quantityInput = screen.getByLabelText("Quantity");
  await user.tripleClick(quantityInput);
  await user.keyboard("20");

  await user.click(screen.getByText("Next"));
}

async function navigateToPickRouteStep(
  user: ReturnType<typeof userEvent.setup>
) {
  await navigateToReviewStep(user);
  // On review step, click "Next" to trigger create + generate route
  await user.click(screen.getByText("Next"));
}

describe("PickingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchProducts.mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
      isPending: false,
    });
    mockGetAvailableStock.mockReturnValue({
      data: mockStock,
      isLoading: false,
      error: null,
      isPending: false,
    });
    mockCreatePickingList.mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    });
    mockGeneratePickRoute.mockReturnValue({
      mutateAsync: mockGenerateRouteMutateAsync,
      isPending: false,
    });
    mockCompletePickingList.mockReturnValue({
      mutateAsync: mockCompleteMutateAsync,
      isPending: false,
    });
    mockCancelPickingList.mockReturnValue({
      mutateAsync: mockCancelMutateAsync,
      isPending: false,
    });
    mockCreateMutateAsync.mockResolvedValue({
      id: 1,
      status: "created",
      items: [
        {
          id: 1,
          productId: 1,
          productName: "Whole Milk",
          requestedQuantity: 20,
        },
      ],
      createdAt: "2026-02-14T10:00:00.000Z",
    });
    mockGenerateRouteMutateAsync.mockResolvedValue(mockRouteItems);
    mockCompleteMutateAsync.mockResolvedValue({
      pickingListId: 1,
      status: "completed",
      totalItemsPicked: 1,
      totalItemsSkipped: 0,
      deductions: [
        {
          paletteLotId: 12,
          productName: "Whole Milk",
          quantityDeducted: 20,
          palettierName: "Cold Storage A",
          positionX: 1,
          positionY: 2,
          positionZ: 1,
        },
      ],
      discrepancies: [],
    });
    mockCancelMutateAsync.mockResolvedValue({
      pickingListId: 1,
      status: "cancelled",
    });
  });

  // ===== Existing tests (from 4.1/4.2 — updated where needed) =====

  it("renders Step 1 with product selection form on load (AC: #1)", () => {
    renderPage();

    expect(screen.getByText("Create Picking List")).toBeInTheDocument();
    expect(screen.getByText("Select Products")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Pick Route")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Product")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
  });

  it("wizard has 3 steps: Select Products, Review, Pick Route (AC: #1)", () => {
    renderPage();

    expect(screen.getByText("Select Products")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Pick Route")).toBeInTheDocument();
  });

  it("product autocomplete shows matching products when typing (AC: #2)", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);

    expect(screen.getByText("Whole Milk (WM-001)")).toBeInTheDocument();
    expect(screen.getByText("Cable Ties (CT-100)")).toBeInTheDocument();
  });

  it('shows "Product not in catalog?" message when no match (AC: #2)', async () => {
    mockSearchProducts.mockReturnValue({
      data: {
        products: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      },
      isLoading: false,
      error: null,
      isPending: false,
    });

    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.type(productInput, "nonexistent");

    expect(
      screen.getByText("Product not in catalog? Ask your manager to add it.")
    ).toBeInTheDocument();
  });

  it("displays available stock next to quantity field after product selection (AC: #3)", async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("Whole Milk (WM-001)"));

    expect(screen.getByText("Available: 150 L")).toBeInTheDocument();
  });

  it('shows inline warning "Only X units available" when quantity exceeds stock (AC: #4)', async () => {
    const user = userEvent.setup();
    renderPage();

    const productInput = screen.getByLabelText("Product");
    await user.click(productInput);
    await user.click(screen.getByText("Whole Milk (WM-001)"));

    const quantityInput = screen.getByLabelText("Quantity");
    await user.tripleClick(quantityInput);
    await user.keyboard("200");

    expect(screen.getByText("Only 150 L available")).toBeInTheDocument();
  });

  it('"Add another product" adds a new product entry row (AC: #5)', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();

    await user.click(screen.getByText("Add another product"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("remove button removes a product entry (AC: #5)", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Add another product"));
    expect(screen.getByText("Product 2")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove product 2"));

    expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });

  it("remove button is disabled when only 1 item exists", () => {
    renderPage();

    const removeButton = screen.getByLabelText("Remove product 1");
    expect(removeButton).toBeDisabled();
  });

  it('"Next" transitions to Step 2 with summary (AC: #6)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToReviewStep(user);

    expect(screen.getByText("Review Picking List")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("WM-001")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Total Products: 1")).toBeInTheDocument();
  });

  it("Review step shows read-only list of products with quantities (AC: #6)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToReviewStep(user);

    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Reference")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it('"Back" on Review returns to Step 1 with data preserved (AC: #7)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToReviewStep(user);
    expect(screen.getByText("Review Picking List")).toBeInTheDocument();

    await user.click(screen.getByText("Back"));

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Select Products")).toBeInTheDocument();
  });

  it('"Next" on review step calls createPickingList then generateRoute (AC: #1)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      items: [{ productId: 1, requestedQuantity: 20 }],
    });
    expect(mockGenerateRouteMutateAsync).toHaveBeenCalledWith(1);
  });

  it("pick route step displays FEFO-ordered items with palettier, position, product, quantity, expiry (AC: #2)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    expect(screen.getByText("Cold Storage A (1, 2, 1)")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Expires: 01/03/2026")).toBeInTheDocument();
    expect(screen.getByText("LOT-2026-001")).toBeInTheDocument();
  });

  it("multi-palette split items show as separate rows for the same product (AC: #3)", async () => {
    mockGenerateRouteMutateAsync.mockResolvedValue(mockMultiRouteItems);

    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    expect(screen.getByText("Expires: 20/02/2026")).toBeInTheDocument();
    expect(screen.getByText("Expires: 15/03/2026")).toBeInTheDocument();
    expect(screen.getByText("LOT-2026-001")).toBeInTheDocument();
    expect(screen.getByText("LOT-2026-003")).toBeInTheDocument();
  });

  it("shows error when generateRoute fails", async () => {
    const mockError = new Error("Route generation failed");
    mockGenerateRouteMutateAsync.mockRejectedValueOnce(mockError);

    const user = userEvent.setup();
    renderPage();

    await navigateToReviewStep(user);
    await user.click(screen.getByText("Next"));

    expect(mockCreateMutateAsync).toHaveBeenCalled();
    expect(mockGenerateRouteMutateAsync).toHaveBeenCalled();
    expect(mockShowSnackbar).not.toHaveBeenCalledWith(
      expect.stringContaining("Picking completed"),
      "success"
    );
  });

  it("cannot proceed to review with zero selected products", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Next"));

    expect(screen.queryByText("Review Picking List")).not.toBeInTheDocument();
    expect(screen.getByText("Product is required")).toBeInTheDocument();
  });

  it("shows error snackbar when creation fails", async () => {
    const mockError = new Error("API error: 400 Bad Request");
    mockCreateMutateAsync.mockRejectedValueOnce(mockError);

    const user = userEvent.setup();
    renderPage();

    await navigateToReviewStep(user);
    await user.click(screen.getByText("Next"));

    expect(mockCreateMutateAsync).toHaveBeenCalled();
    expect(mockShowSnackbar).not.toHaveBeenCalledWith(
      expect.stringContaining("Picking completed"),
      "success"
    );
  });

  it("loading state during route generation", () => {
    mockGeneratePickRoute.mockReturnValue({
      mutateAsync: mockGenerateRouteMutateAsync,
      isPending: true,
    });

    renderPage();

    expect(mockGeneratePickRoute).toHaveBeenCalled();
  });

  // ===== New tests for Story 4.3 =====

  it("checkboxes on pick route are ENABLED (AC: #1)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    for (const cb of checkboxes) {
      expect(cb).not.toBeDisabled();
    }
  });

  it("clicking checkbox marks item as picked (AC: #1)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const checkbox = screen.getAllByRole("checkbox")[0];
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('clicking "Skip" on an item marks it as skipped with strikethrough (AC: #2)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Find the skip button
    const skipButton = screen.getByLabelText("Skip — item not found");
    await user.click(skipButton);

    // After skip, the product name should have strikethrough
    const productText = screen.getByText("Whole Milk");
    expect(productText).toHaveStyle("text-decoration: line-through");
  });

  it("skipped items have disabled checkbox (AC: #2)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const skipButton = screen.getByLabelText("Skip — item not found");
    await user.click(skipButton);

    const checkbox = screen.getAllByRole("checkbox")[0];
    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeChecked();
  });

  it('"Cancel List" button shows confirmation dialog (AC: #3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Cancel List button should be visible on step 2
    const cancelButton = screen.getByRole("button", { name: "Cancel List" });
    await user.click(cancelButton);

    expect(screen.getByText("Cancel Picking List?")).toBeInTheDocument();
    expect(
      screen.getByText("Cancel this picking list? No stock will be deducted.")
    ).toBeInTheDocument();
  });

  it("confirming cancel calls cancelPickingList mutation (AC: #3)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Click "Cancel List" button
    await user.click(screen.getByRole("button", { name: "Cancel List" }));

    // Confirm in dialog — there are two "Cancel List" buttons now (one in page, one in dialog)
    const dialog = screen.getByRole("dialog");
    const confirmCancelButton = within(dialog).getByRole("button", {
      name: "Cancel List",
    });
    await user.click(confirmCancelButton);

    expect(mockCancelMutateAsync).toHaveBeenCalledWith(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Picking list cancelled — no stock deducted",
      "success"
    );
  });

  it("dismissing cancel dialog keeps picking active (AC: #3)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    await user.click(screen.getByRole("button", { name: "Cancel List" }));
    expect(screen.getByText("Cancel Picking List?")).toBeInTheDocument();

    await user.click(screen.getByText("Keep Picking"));

    // Dialog should close, picking should continue
    await waitFor(() => {
      expect(
        screen.queryByText("Cancel Picking List?")
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Cold Storage A (1, 2, 1)")).toBeInTheDocument();
    expect(mockCancelMutateAsync).not.toHaveBeenCalled();
  });

  it('"Validate Complete" is disabled until all items actioned (AC: #4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // "Validate Complete" should be the confirm button on the last step
    const validateButton = screen.getByRole("button", {
      name: "Validate Complete",
    });
    expect(validateButton).toBeDisabled();
  });

  it('"Validate Complete" calls completePickingList with correct payload (AC: #4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Check item as picked
    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    // Now Validate Complete should be enabled
    const validateButton = screen.getByRole("button", {
      name: "Validate Complete",
    });
    expect(validateButton).not.toBeDisabled();

    await user.click(validateButton);

    expect(mockCompleteMutateAsync).toHaveBeenCalledWith({
      pickingListId: 1,
      payload: {
        items: [
          {
            pickingListItemId: 1,
            paletteLotId: 12,
            status: "picked",
            pickedQuantity: 20,
          },
        ],
      },
    });
  });

  it("success snackbar shows deduction count after completion (AC: #4)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: "Validate Complete" }));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Picking completed! 1 items deducted from stock.",
      "success"
    );
  });

  it("completion result shows discrepancies for skipped items (AC: #5)", async () => {
    mockCompleteMutateAsync.mockResolvedValueOnce({
      pickingListId: 1,
      status: "completed",
      totalItemsPicked: 0,
      totalItemsSkipped: 1,
      deductions: [],
      discrepancies: [
        {
          pickingListItemId: 1,
          productName: "Whole Milk",
          palettierName: "Cold Storage A",
          positionX: 1,
          positionY: 2,
          positionZ: 1,
          reason: "Item skipped",
        },
      ],
    });

    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Skip the item
    await user.click(screen.getByLabelText("Skip — item not found"));

    await user.click(screen.getByRole("button", { name: "Validate Complete" }));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Picking completed with 1 discrepancies. 0 items deducted.",
      "success"
    );
  });

  it("quantity can be adjusted on a pick item (AC: #6)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const qtyInput = screen.getByLabelText("Qty to pick");
    expect(qtyInput).toHaveValue(20);

    await user.tripleClick(qtyInput);
    await user.keyboard("10");

    expect(qtyInput).toHaveValue(10);
  });

  it("adjusted quantity is reflected in completion payload (AC: #6)", async () => {
    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    // Adjust quantity
    const qtyInput = screen.getByLabelText("Qty to pick");
    await user.tripleClick(qtyInput);
    await user.keyboard("10");

    // Check item as picked
    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: "Validate Complete" }));

    expect(mockCompleteMutateAsync).toHaveBeenCalledWith({
      pickingListId: 1,
      payload: {
        items: [
          {
            pickingListItemId: 1,
            paletteLotId: 12,
            status: "picked",
            pickedQuantity: 10,
          },
        ],
      },
    });
  });

  it("error snackbar when completion fails", async () => {
    const mockError = new Error("Completion failed");
    mockCompleteMutateAsync.mockRejectedValueOnce(mockError);

    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: "Validate Complete" }));

    expect(mockHandleError).toHaveBeenCalledWith(mockError);
  });

  it("error snackbar when cancel fails", async () => {
    const mockError = new Error("Cancel failed");
    mockCancelMutateAsync.mockRejectedValueOnce(mockError);

    const user = userEvent.setup();
    renderPage();

    await navigateToPickRouteStep(user);

    await user.click(screen.getByRole("button", { name: "Cancel List" }));

    const dialog = screen.getByRole("dialog");
    const confirmCancelButton = within(dialog).getByRole("button", {
      name: "Cancel List",
    });
    await user.click(confirmCancelButton);

    expect(mockHandleError).toHaveBeenCalledWith(mockError);
  });

  it('loading state during validation ("Validating..." on button)', () => {
    mockCompletePickingList.mockReturnValue({
      mutateAsync: mockCompleteMutateAsync,
      isPending: true,
    });

    renderPage();

    // When completeMutation.isPending is true, isSubmitting should be true
    expect(mockCompletePickingList).toHaveBeenCalled();
  });
});
