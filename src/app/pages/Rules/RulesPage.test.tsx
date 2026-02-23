import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RulesPage from "./RulesPage";
import type { RuleResponse, RulesListResponse } from "./types";

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

const mockRules: RuleResponse[] = [
  {
    id: 1,
    name: "Cold Storage Zone",
    description: "Products requiring cold storage",
    type: "storage_condition",
    isActive: true,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
    storageConditionConfig: {
      id: 1,
      conditionType: "refrigerated",
      selectionMode: "palettier_type",
      palettierTypeId: 1,
      palettierIds: [],
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-20T14:45:00.000Z",
    },
    productIds: [1, 2, 3],
  },
  {
    id: 2,
    name: "Ground Only Heavy Items",
    description: null,
    type: "placement_constraint",
    isActive: false,
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: "2024-02-05T12:00:00.000Z",
    placementConstraintConfig: {
      id: 1,
      constraintType: "ground_only",
      maxHeight: null,
      createdAt: "2024-02-01T08:00:00.000Z",
      updatedAt: "2024-02-05T12:00:00.000Z",
    },
    productIds: [],
  },
];

const mockRulesListResponse: RulesListResponse = {
  rules: mockRules,
  meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
};

let rulesOverride: {
  data: RulesListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
} | null = null;

const mockDeleteMutateAsync = vi.fn().mockResolvedValue(undefined);
const mockCreateMutateAsync = vi
  .fn()
  .mockResolvedValue({ rules: [], count: 0 });
const mockUpdateMutateAsync = vi.fn().mockResolvedValue({});

vi.mock("./api", () => ({
  useGetRules: () =>
    rulesOverride ?? {
      data: mockRulesListResponse,
      isLoading: false,
      error: null,
    },
  useGetRuleById: () => ({
    data: undefined,
  }),
  useCreateRule: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateRule: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
  useDeleteRule: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
  useGetCategories: () => ({
    data: {
      categories: [
        { id: 1, name: "Hazardous", createdAt: "", updatedAt: "" },
        { id: 2, name: "Fragile", createdAt: "", updatedAt: "" },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    },
  }),
  useGetActiveViolations: () => ({
    data: [],
  }),
}));

vi.mock("../Palettier/api", () => ({
  useGetPalettiers: () => ({
    data: [
      {
        id: 1,
        name: "PAL-A01",
        palettierTypeId: 1,
        width: 5,
        depth: 3,
        height: 4,
        totalCapacity: 60,
        paletteCount: 0,
        occupiedPositions: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
  }),
  useGetPalettierTypes: () => ({
    data: [
      { id: 1, name: "Standard" },
      { id: 2, name: "Refrigerated" },
    ],
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
      <MemoryRouter initialEntries={["/rules"]}>
        <RulesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("RulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rulesOverride = null;
  });

  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("Placement Rule Management")).toBeInTheDocument();
  });

  it("shows loading spinner while rules are loading", () => {
    rulesOverride = { data: undefined, isLoading: true, error: null };
    renderPage();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error alert when rules fail to load", () => {
    rulesOverride = {
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
    };
    renderPage();
    expect(
      screen.getByText("Failed to load rules. Please try again.")
    ).toBeInTheDocument();
  });

  it("renders rules list with data", () => {
    renderPage();
    expect(screen.getByText("Cold Storage Zone")).toBeInTheDocument();
    expect(screen.getByText("Ground Only Heavy Items")).toBeInTheDocument();
  });

  it("shows rule type labels", () => {
    renderPage();
    expect(screen.getByText("Storage Condition")).toBeInTheDocument();
    expect(screen.getByText("Placement Constraint")).toBeInTheDocument();
  });

  it("shows active/inactive status chips", () => {
    renderPage();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows product count for rules with linked products", () => {
    renderPage();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows empty state when no rules exist", () => {
    rulesOverride = {
      data: {
        rules: [],
        meta: { total: 0, page: 1, limit: 100, totalPages: 0 },
      },
      isLoading: false,
      error: null,
    };
    renderPage();
    expect(
      screen.getByText(
        "No placement rules configured yet. Create your first rule to enable automatic placement recommendations."
      )
    ).toBeInTheDocument();
  });

  it('renders "Create New Rule" button', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /create new rule/i })
    ).toBeInTheDocument();
  });

  it("opens create wizard when Create New Rule is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /create new rule/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Create New Rule")).toBeInTheDocument();
    expect(within(dialog).getByText("Details")).toBeInTheDocument();
    expect(within(dialog).getByText("Review")).toBeInTheDocument();
  });

  it("opens edit wizard when clicking a rule row", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Cold Storage Zone"));

    expect(screen.getByText("Edit Rule")).toBeInTheDocument();
  });

  it("pre-fills edit wizard with existing rule data", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Cold Storage Zone"));

    const dialog = screen.getByRole("dialog");
    const nameInput = within(dialog).getByLabelText("Rule Name");
    expect(nameInput).toHaveValue("Cold Storage Zone");
  });

  it("shows delete confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete Rule")).toBeInTheDocument();
  });

  it("shows product count in delete confirmation for rules with products", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    expect(
      screen.getByText(/this rule is used by 3 products/i)
    ).toBeInTheDocument();
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

  it("shows generic delete message for rules with no linked products", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[1]);

    expect(
      screen.getByText(
        /are you sure you want to delete "Ground Only Heavy Items"\? This action cannot be undone\./i
      )
    ).toBeInTheDocument();
  });

  it("closes delete dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete Rule")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it("shows cancel and delete buttons in delete confirmation dialog", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Cancel" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Delete" })
    ).toBeInTheDocument();
  });

  it("shows violation dialog when update returns violations", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({
      id: 1,
      name: "Cold Storage Zone",
      violations: [
        {
          paletteId: 1,
          palettierName: "Rack A1",
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          productName: "Frozen Fish",
          ruleName: "Cold Storage Zone",
          ruleType: "storage_condition",
          violationReason: "Palette is in wrong palettier type",
        },
      ],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Cold Storage Zone"));

    const wizardDialog = screen.getByRole("dialog");
    await user.click(
      within(wizardDialog).getByRole("button", { name: /next/i })
    );

    const saveButton = await within(wizardDialog).findByRole("button", {
      name: "Save Changes",
    });
    await user.click(saveButton);

    await screen.findByText("Placement Rule Violations Detected");
    expect(screen.getByText("Rack A1")).toBeInTheDocument();
    expect(screen.getByText("Frozen Fish")).toBeInTheDocument();
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it("shows success snackbar when update returns no violations", async () => {
    mockUpdateMutateAsync.mockResolvedValueOnce({
      id: 1,
      name: "Cold Storage Zone",
      violations: [],
    });

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("Cold Storage Zone"));

    const wizardDialog = screen.getByRole("dialog");
    await user.click(
      within(wizardDialog).getByRole("button", { name: /next/i })
    );

    const saveButton = await within(wizardDialog).findByRole("button", {
      name: "Save Changes",
    });
    await user.click(saveButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "Rule updated successfully",
      "success"
    );
    expect(
      screen.queryByText("Placement Rule Violations Detected")
    ).not.toBeInTheDocument();
  });
});
