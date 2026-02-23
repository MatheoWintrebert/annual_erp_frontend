import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ConflictResolutionStep from "./ConflictResolutionStep";
import type {
  ConflictPlacementResult,
  IntakeProductEntry,
  ProductOption,
} from "../types";

const mockShowSnackbar = vi.fn();

vi.mock("../../../components/ui/SnackbarProvider", () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
}));

vi.mock("../../../hooks/useApiError", () => ({
  useApiError: () => ({
    handleError: vi.fn(),
    handleResponseError: vi.fn(),
  }),
}));

const mockRegisterConflictMutateAsync = vi.fn().mockResolvedValue({
  palettes: [],
});

vi.mock("../api", () => ({
  useGetPalettiers: () => ({
    data: [
      { id: 1, name: "Cold Storage A", width: 5, depth: 3, height: 4 },
      { id: 2, name: "Dry Storage B", width: 5, depth: 3, height: 4 },
    ],
    isLoading: false,
    error: null,
  }),
  useRegisterConflictResolution: () => ({
    mutateAsync: mockRegisterConflictMutateAsync,
    isPending: false,
  }),
}));

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

const mockConflictResultWithNull: ConflictPlacementResult = {
  status: "conflict",
  conflictExplanation: "No placement available for some products",
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
      recommendation: null,
      reasoning:
        "No palettier satisfies the rules for White Sugar (blocked by: Dry storage required)",
    },
  ],
};

const mockFormItems: IntakeProductEntry[] = [
  {
    productId: 1,
    lotReference: "",
    isManualLot: false,
    expiryDate: "",
    quantity: 50,
  },
  {
    productId: 2,
    lotReference: "",
    isManualLot: false,
    expiryDate: "",
    quantity: 30,
  },
];

const mockProducts: ProductOption[] = [
  { id: 1, name: "Organic Flour", reference: "REF-001", unitOfMeasureId: 1 },
  { id: 2, name: "White Sugar", reference: "REF-002", unitOfMeasureId: 2 },
];

const mockOnConfirm = vi.fn();
const mockOnRegisterAnother = vi.fn();
const mockOnBack = vi.fn();

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderComponent = (
  conflictResult: ConflictPlacementResult = mockConflictResult
) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ConflictResolutionStep
        conflictResult={conflictResult}
        formItems={mockFormItems}
        products={mockProducts}
        onConfirm={mockOnConfirm}
        onRegisterAnother={mockOnRegisterAnother}
        onBack={mockOnBack}
      />
    </QueryClientProvider>
  );

describe("ConflictResolutionStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render info alert with conflict explanation", () => {
    renderComponent();

    expect(
      screen.getByText(
        "Organic Flour needs cold storage, White Sugar needs dry storage"
      )
    ).toBeInTheDocument();
  });

  it("should render correct number of group cards", () => {
    renderComponent();

    expect(screen.getByText(/Group 1/)).toBeInTheDocument();
    expect(screen.getByText(/Group 2/)).toBeInTheDocument();
  });

  it("should show product names in group headers", () => {
    renderComponent();

    expect(screen.getByText("Group 1: Organic Flour")).toBeInTheDocument();
    expect(screen.getByText("Group 2: White Sugar")).toBeInTheDocument();
  });

  it("should show product details with quantities", () => {
    renderComponent();

    expect(
      screen.getByText("REF-001 — Organic Flour × 50")
    ).toBeInTheDocument();
    expect(screen.getByText("REF-002 — White Sugar × 30")).toBeInTheDocument();
  });

  it("should show DirectiveCard for groups with recommendations", () => {
    renderComponent();

    expect(
      screen.getByText("Place in: Cold Storage A, Position (0, 0, 0)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Place in: Dry Storage B, Position (1, 0, 0)")
    ).toBeInTheDocument();
  });

  it("should show warning for groups without recommendations", () => {
    renderComponent(mockConflictResultWithNull);

    expect(
      screen.getByText(/No palettier satisfies the rules for White Sugar.*enter position manually below/i)
    ).toBeInTheDocument();
  });

  it("should show manual position fields when toggle is switched off", async () => {
    const user = userEvent.setup();
    renderComponent();

    const toggles = screen.getAllByRole("checkbox");
    await user.click(toggles[0]);

    expect(
      screen.getByLabelText("Palettier for Group 1")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Position X (Group 1)")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Position Y (Group 1)")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Position Z (Group 1)")
    ).toBeInTheDocument();
  });

  it("should have Confirm All Placements enabled when all groups use system recommendation", () => {
    renderComponent();

    const confirmButton = screen.getByText("Confirm All Placements");
    expect(confirmButton).toBeEnabled();
  });

  it("should disable Confirm All Placements when manual position is incomplete", async () => {
    const user = userEvent.setup();
    renderComponent();

    const toggles = screen.getAllByRole("checkbox");
    await user.click(toggles[0]);

    const confirmButton = screen.getByText("Confirm All Placements");
    expect(confirmButton).toBeDisabled();
  });

  it("should call register mutation and show success on confirm", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Confirm All Placements"));

    expect(mockRegisterConflictMutateAsync).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      "All palettes registered successfully",
      "success"
    );
  });

  it("should show Done and Register Another buttons after successful registration", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Confirm All Placements"));

    expect(
      screen.getByText(
        "All product groups have been registered at their placements."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Register Another")).toBeInTheDocument();
  });

  it("should call onConfirm when clicking Done after success", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Confirm All Placements"));
    await user.click(screen.getByText("Done"));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should call onRegisterAnother when clicking Register Another after success", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Confirm All Placements"));
    await user.click(screen.getByText("Register Another"));

    expect(mockOnRegisterAnother).toHaveBeenCalled();
  });

  it("should call onBack when clicking Back to Products", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText("Back to Products"));

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("should force manual entry when group has null recommendation", () => {
    renderComponent(mockConflictResultWithNull);

    const toggles = screen.getAllByRole("checkbox");
    // Second toggle should be unchecked and disabled (null recommendation)
    expect(toggles[1]).not.toBeChecked();
    expect(toggles[1]).toBeDisabled();
  });

  it("should disable confirm when manual position is out of bounds (H7)", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch first group to manual
    const toggles = screen.getAllByRole("checkbox");
    await user.click(toggles[0]);

    // Select a palettier via autocomplete
    const palettierInput = screen.getByLabelText("Palettier for Group 1");
    await user.click(palettierInput);
    await user.click(screen.getByText("Cold Storage A"));

    // Enter out-of-bounds X (palettier width is 5, so 99 is invalid)
    const posX = screen.getByLabelText("Position X (Group 1)");
    await user.clear(posX);
    await user.type(posX, "99");

    const posY = screen.getByLabelText("Position Y (Group 1)");
    await user.clear(posY);
    await user.type(posY, "0");

    const posZ = screen.getByLabelText("Position Z (Group 1)");
    await user.clear(posZ);
    await user.type(posZ, "0");

    // Confirm should be disabled due to bounds violation
    expect(screen.getByText("Confirm All Placements")).toBeDisabled();
    // Error text should be shown
    expect(screen.getByText("X must be < 5")).toBeInTheDocument();
  });

  it("should enable confirm and call register when manual position is valid (M7)", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Switch first group to manual
    const toggles = screen.getAllByRole("checkbox");
    await user.click(toggles[0]);

    // Select a palettier via autocomplete
    const palettierInput = screen.getByLabelText("Palettier for Group 1");
    await user.click(palettierInput);
    await user.click(screen.getByText("Cold Storage A"));

    // Enter valid position (within 5x3x4 dimensions)
    const posX = screen.getByLabelText("Position X (Group 1)");
    await user.clear(posX);
    await user.type(posX, "2");

    const posY = screen.getByLabelText("Position Y (Group 1)");
    await user.clear(posY);
    await user.type(posY, "1");

    const posZ = screen.getByLabelText("Position Z (Group 1)");
    await user.clear(posZ);
    await user.type(posZ, "0");

    // Confirm should be enabled
    const confirmButton = screen.getByText("Confirm All Placements");
    expect(confirmButton).toBeEnabled();

    // Click confirm and verify payload
    await user.click(confirmButton);

    expect(mockRegisterConflictMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({
            palettierId: 1,
            positionX: 2,
            positionY: 1,
            positionZ: 0,
          }),
        ]) as unknown,
      })
    );
  });
});
