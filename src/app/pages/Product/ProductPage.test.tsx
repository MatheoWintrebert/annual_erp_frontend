import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductPage from "./ProductPage";
import type { ProductResponse, ProductsListResponse } from "./types";

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

const mockProducts: ProductResponse[] = [
  {
    id: 1,
    reference: "REF-001",
    name: "Organic Flour 25kg",
    unitOfMeasureId: 1,
    categoryId: 1,
    minimumStock: 10,
    expiryAlertThreshold: 30,
    ruleIds: [1, 2],
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
  },
  {
    id: 2,
    reference: "REF-002",
    name: "White Sugar 50kg",
    unitOfMeasureId: 1,
    categoryId: null,
    minimumStock: null,
    expiryAlertThreshold: null,
    ruleIds: [],
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: "2024-02-05T12:00:00.000Z",
  },
];

const mockProductsListResponse: ProductsListResponse = {
  products: mockProducts,
  meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
};

let productsOverride: {
  data: ProductsListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
} | null = null;

let paletteCountOverride: {
  data: { count: number } | undefined;
  isLoading: boolean;
} | null = null;

const mockDeleteMutateAsync = vi.fn().mockResolvedValue(undefined);
const mockCreateMutateAsync = vi.fn().mockResolvedValue({});
const mockUpdateMutateAsync = vi.fn().mockResolvedValue({});
const mockCreateCategoryMutateAsync = vi.fn().mockResolvedValue({
  id: 99,
  name: "New Category",
  createdAt: "",
  updatedAt: "",
});
const mockCreateUnitMutateAsync = vi.fn().mockResolvedValue({
  id: 99,
  name: "New Unit",
  abbreviation: "nu",
  createdAt: "",
  updatedAt: "",
});

vi.mock("./api", () => ({
  useGetProducts: () =>
    productsOverride ?? {
      data: mockProductsListResponse,
      isLoading: false,
      error: null,
    },
  useGetProductById: () => ({
    data: undefined,
  }),
  useCreateProduct: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateProduct: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
  useDeleteProduct: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
  useGetProductPaletteCount: () =>
    paletteCountOverride ?? {
      data: { count: 0 },
      isLoading: false,
    },
  useGetCategories: () => ({
    data: {
      categories: [
        { id: 1, name: "Grains", createdAt: "", updatedAt: "" },
        { id: 2, name: "Chemicals", createdAt: "", updatedAt: "" },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    },
  }),
  useGetUnitsOfMeasure: () => ({
    data: {
      unitsOfMeasure: [
        {
          id: 1,
          name: "Kilogram",
          abbreviation: "kg",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: 2,
          name: "Litre",
          abbreviation: "L",
          createdAt: "",
          updatedAt: "",
        },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    },
  }),
  useGetRulesForSelect: () => ({
    data: {
      rules: [
        {
          id: 1,
          name: "Cold Storage",
          description: "Requires cold storage",
          ruleType: "storage_condition",
        },
        {
          id: 2,
          name: "Ground Only",
          description: "Must be on ground level",
          ruleType: "placement_constraint",
        },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    },
  }),
  useCreateCategory: () => ({
    mutateAsync: mockCreateCategoryMutateAsync,
    isPending: false,
  }),
  useCreateUnitOfMeasure: () => ({
    mutateAsync: mockCreateUnitMutateAsync,
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
      <MemoryRouter initialEntries={["/product"]}>
        <ProductPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("ProductPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsOverride = null;
    paletteCountOverride = null;
  });

  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("Product Management")).toBeInTheDocument();
  });

  it("shows loading spinner while products are loading", () => {
    productsOverride = { data: undefined, isLoading: true, error: null };
    renderPage();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error alert when products fail to load", () => {
    productsOverride = {
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    };
    renderPage();
    expect(
      screen.getByText("Failed to load products. Please try again.")
    ).toBeInTheDocument();
  });

  it("renders product list with data", () => {
    renderPage();
    expect(screen.getByText("Organic Flour 25kg")).toBeInTheDocument();
    expect(screen.getByText("White Sugar 50kg")).toBeInTheDocument();
  });

  it("shows product reference codes", () => {
    renderPage();
    expect(screen.getByText("REF-001")).toBeInTheDocument();
    expect(screen.getByText("REF-002")).toBeInTheDocument();
  });

  it("shows category name for products with category", () => {
    renderPage();
    expect(screen.getByText("Grains")).toBeInTheDocument();
  });

  it("shows unit abbreviation", () => {
    renderPage();
    const kgCells = screen.getAllByText("kg");
    expect(kgCells.length).toBeGreaterThanOrEqual(1);
  });

  it("shows rule count for products", () => {
    renderPage();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows empty state when no products exist", () => {
    productsOverride = {
      data: {
        products: [],
        meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    };
    renderPage();
    expect(
      screen.getByText(
        "No products configured yet. Create your first product to start tracking inventory."
      )
    ).toBeInTheDocument();
  });

  it('renders "Create New Product" button', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /create new product/i })
    ).toBeInTheDocument();
  });

  it("opens create wizard when Create New Product is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /create new product/i })
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Create New Product")).toBeInTheDocument();
    expect(within(dialog).getByText("Details")).toBeInTheDocument();
    expect(within(dialog).getByText("Review")).toBeInTheDocument();
  });

  it("opens edit wizard when clicking a product row", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Organic Flour 25kg"));

    expect(screen.getByText("Edit Product")).toBeInTheDocument();
  });

  it("pre-fills edit wizard with existing product data", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Organic Flour 25kg"));

    const dialog = screen.getByRole("dialog");
    const nameInput = within(dialog).getByLabelText("Product Name");
    expect(nameInput).toHaveValue("Organic Flour 25kg");
  });

  it("shows delete confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete Product")).toBeInTheDocument();
  });

  it("shows generic delete message when product has no active palettes", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    expect(
      screen.getByText(
        /are you sure you want to delete "Organic Flour 25kg"\? This action cannot be undone\./i
      )
    ).toBeInTheDocument();
  });

  it("shows palette count and blocks deletion when product has active palettes", async () => {
    paletteCountOverride = {
      data: { count: 3 },
      isLoading: false,
    };

    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    expect(
      screen.getByText(/this product is on 3 active palettes/i)
    ).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    const deleteButton = within(dialog).getByRole("button", {
      name: "Delete",
    });
    expect(deleteButton).toBeDisabled();
  });

  it("calls delete mutation when Delete button in confirmation is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith(1);
  });

  it("closes delete dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete Product")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it("calls update mutation with correct payload when edit wizard is completed", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Organic Flour 25kg"));

    const dialog = screen.getByRole("dialog");

    const nameInput = within(dialog).getByLabelText("Product Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Organic Flour 50kg");

    await user.click(within(dialog).getByRole("button", { name: /next/i }));

    const saveButton = await within(dialog).findByRole("button", {
      name: "Save Changes",
    });
    await user.click(saveButton);

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      id: 1,
      reference: "REF-001",
      name: "Organic Flour 50kg",
      unitOfMeasureId: 1,
      categoryId: 1,
      minimumStock: 10,
      expiryAlertThreshold: 30,
      ruleIds: [1, 2],
    });
  });

  it("opens inline category creation dialog and creates a category", { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /create new product/i })
    );

    await user.click(screen.getByRole("button", { name: /add new category/i }));

    expect(screen.getByText("Add New Category")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Category Name"), "Frozen Goods");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockCreateCategoryMutateAsync).toHaveBeenCalledWith({
      name: "Frozen Goods",
    });
  });

  it("opens inline unit creation dialog and creates a unit", { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /create new product/i })
    );

    await user.click(
      screen.getByRole("button", { name: /add new unit of measure/i })
    );

    expect(screen.getByText("Add New Unit of Measure")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Unit Name"), "Gram");
    await user.type(screen.getByLabelText("Abbreviation"), "g");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(mockCreateUnitMutateAsync).toHaveBeenCalledWith({
      name: "Gram",
      abbreviation: "g",
    });
  });

  it("calls create mutation with correct payload when wizard is completed", { timeout: 15000 }, async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /create new product/i })
    );

    const dialog = screen.getByRole("dialog");

    await user.type(within(dialog).getByLabelText("Reference Code"), "REF-NEW");
    await user.type(
      within(dialog).getByLabelText("Product Name"),
      "Test Product"
    );

    const unitSelect = within(dialog).getByLabelText("Unit of Measure");
    await user.click(unitSelect);
    const unitOption = await screen.findByRole("option", {
      name: "Kilogram (kg)",
    });
    await user.click(unitOption);

    await user.click(within(dialog).getByRole("button", { name: /next/i }));

    const confirmButton = await within(dialog).findByRole("button", {
      name: "Confirm",
    });
    await user.click(confirmButton);

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      reference: "REF-NEW",
      name: "Test Product",
      unitOfMeasureId: 1,
      categoryId: null,
      minimumStock: null,
      expiryAlertThreshold: null,
      ruleIds: [],
    });
  });

  it("shows violation dialog when update returns violations", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({
      id: 1,
      name: "Organic Flour 25kg",
      violations: [
        {
          paletteId: 10,
          palettierName: "Rack C3",
          positionX: 2,
          positionY: 1,
          positionZ: 4,
          productName: "Organic Flour 25kg",
          ruleName: "Max Height Rule",
          ruleType: "placement_constraint",
          violationReason: "Palette exceeds maximum height",
        },
      ],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Organic Flour 25kg"));

    const wizardDialog = screen.getByRole("dialog");
    await user.click(
      within(wizardDialog).getByRole("button", { name: /next/i })
    );

    const saveButton = await within(wizardDialog).findByRole("button", {
      name: "Save Changes",
    });
    await user.click(saveButton);

    await screen.findByText("Placement Rule Violations Detected");
    expect(screen.getByText("Rack C3")).toBeInTheDocument();
    expect(screen.getByText("Max Height Rule")).toBeInTheDocument();
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it("shows success snackbar when update returns no violations", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({
      id: 1,
      name: "Organic Flour 25kg",
      violations: [],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Organic Flour 25kg"));

    const wizardDialog = screen.getByRole("dialog");
    await user.click(
      within(wizardDialog).getByRole("button", { name: /next/i })
    );

    const saveButton = await within(wizardDialog).findByRole("button", {
      name: "Save Changes",
    });
    await user.click(saveButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Product updated successfully",
      "success"
    );
    expect(
      screen.queryByText("Placement Rule Violations Detected")
    ).not.toBeInTheDocument();
  });
});
