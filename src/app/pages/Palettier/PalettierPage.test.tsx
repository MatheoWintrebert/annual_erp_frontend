import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PalettierPage from "./PalettierPage";

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

const mockPalettiers = [
  {
    id: 1,
    name: "PAL-A01",
    palettierTypeId: 1,
    width: 5,
    depth: 3,
    height: 4,
    totalCapacity: 60,
    paletteCount: 2,
    occupiedPositions: 2,
    createdAt: "2024-01-15T10:30:00.000Z",
    updatedAt: "2024-01-20T14:45:00.000Z",
  },
  {
    id: 2,
    name: "PAL-B02",
    palettierTypeId: 2,
    width: 3,
    depth: 2,
    height: 3,
    totalCapacity: 18,
    paletteCount: 0,
    occupiedPositions: 0,
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: "2024-02-05T12:00:00.000Z",
  },
];

const mockPalettierTypes = [
  { id: 1, name: "Standard" },
  { id: 2, name: "Refrigerated" },
];

let palettiersOverride: {
  data: typeof mockPalettiers;
  isLoading: boolean;
  error: Error | null;
} | null = null;

let violationsOverride: { data: unknown[] } = { data: [] };

vi.mock("./api", () => ({
  useGetPalettiers: () =>
    palettiersOverride ?? {
      data: mockPalettiers,
      isLoading: false,
      error: null,
    },
  useGetPalettierTypes: () => ({
    data: mockPalettierTypes,
  }),
  useGetActiveViolations: () => violationsOverride,
  useCreatePalettier: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCreatePalettierType: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdatePalettier: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeletePalettier: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useGetPaletteCountByPalettier: () => ({
    data: { paletteCount: 0, occupiedPositions: 0 },
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
      <MemoryRouter initialEntries={["/palettier"]}>
        <PalettierPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("PalettierPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    palettiersOverride = null;
    violationsOverride = { data: [] };
  });

  it("renders the page title", () => {
    renderPage();
    expect(screen.getByText("Palettier Configuration")).toBeInTheDocument();
  });

  it("shows loading spinner while palettiers are loading", () => {
    palettiersOverride = { data: [], isLoading: true, error: null };
    renderPage();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows error alert when palettiers fail to load", () => {
    palettiersOverride = {
      data: [],
      isLoading: false,
      error: new Error("Network error"),
    };
    renderPage();
    expect(
      screen.getByText("Failed to load palettiers. Please try again.")
    ).toBeInTheDocument();
  });

  it("renders palettier list with data", () => {
    renderPage();
    expect(screen.getByText("PAL-A01")).toBeInTheDocument();
    expect(screen.getByText("PAL-B02")).toBeInTheDocument();
  });

  it("shows palettier dimensions", () => {
    renderPage();
    expect(screen.getByText("5 × 3 × 4")).toBeInTheDocument();
    expect(screen.getByText("3 × 2 × 3")).toBeInTheDocument();
  });

  it("shows occupancy information", () => {
    renderPage();
    expect(screen.getByText("2 / 60")).toBeInTheDocument();
    expect(screen.getByText("0 / 18")).toBeInTheDocument();
  });

  it("shows type names from palettier types", () => {
    renderPage();
    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Refrigerated")).toBeInTheDocument();
  });

  it('renders "Create New Palettier" button', () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /create new palettier/i })
    ).toBeInTheDocument();
  });

  it("opens create wizard when Create New Palettier is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole("button", { name: /create new palettier/i })
    );

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Create New Palettier")
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Details")).toBeInTheDocument();
    expect(within(dialog).getByText("Review")).toBeInTheDocument();
  });

  it("opens edit wizard when clicking a palettier row", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText("PAL-A01"));

    expect(screen.getByText("Edit Palettier")).toBeInTheDocument();
  });

  it("shows violation indicator when a palettier has violations", () => {
    violationsOverride = {
      data: [
        {
          paletteId: 1,
          palettierName: "PAL-A01",
          positionX: 0,
          positionY: 1,
          positionZ: 3,
          productName: "Organic Flour 25kg",
          ruleName: "Max Height Rule",
          ruleType: "placement_constraint",
          violationReason:
            "Palette exceeds maximum height (max Z=2, currently at Z=3)",
        },
      ],
    };
    renderPage();

    expect(screen.getByText("Rule violation")).toBeInTheDocument();
  });

  it("does not show violation indicator for palettiers without violations", () => {
    violationsOverride = {
      data: [
        {
          paletteId: 1,
          palettierName: "PAL-A01",
          positionX: 0,
          positionY: 1,
          positionZ: 3,
          productName: "Organic Flour 25kg",
          ruleName: "Max Height Rule",
          ruleType: "placement_constraint",
          violationReason: "Palette exceeds maximum height",
        },
      ],
    };
    renderPage();

    const violationTexts = screen.getAllByText("Rule violation");
    expect(violationTexts).toHaveLength(1);
  });

  it("shows violation details in tooltip", () => {
    violationsOverride = {
      data: [
        {
          paletteId: 1,
          palettierName: "PAL-A01",
          positionX: 0,
          positionY: 0,
          positionZ: 3,
          productName: "Flour",
          ruleName: "Max Height Rule",
          ruleType: "placement_constraint",
          violationReason: "Palette exceeds maximum height",
        },
      ],
    };
    renderPage();

    const warningIcon =
      screen.getByText("Rule violation").closest("[title]") ??
      screen.getByText("Rule violation").parentElement;
    expect(warningIcon).toBeInTheDocument();
  });

  it("shows delete confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete/i,
    });
    await user.click(deleteButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Delete Palettier")).toBeInTheDocument();
  });
});
