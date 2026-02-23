import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import ViolationAlertDialog from "./ViolationAlertDialog";
import type { RuleViolation } from "./ViolationAlertDialog";

const mockViolations: RuleViolation[] = [
  {
    paletteId: 1,
    palettierName: "Rack A1",
    positionX: 0,
    positionY: 1,
    positionZ: 3,
    productName: "Organic Flour 25kg",
    ruleName: "Max Height Rule",
    ruleType: "placement_constraint",
    violationReason:
      "Palette exceeds maximum height (max Z=2, currently at Z=3)",
  },
  {
    paletteId: 2,
    palettierName: "Rack B2",
    positionX: 1,
    positionY: 0,
    positionZ: 0,
    productName: "Frozen Fish",
    ruleName: "Cold Storage Zone",
    ruleType: "storage_condition",
    violationReason:
      "Palette is in a palettier of wrong type (requires type ID 2)",
  },
];

describe("ViolationAlertDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <ViolationAlertDialog
        open={false}
        onClose={vi.fn()}
        violations={mockViolations}
      />
    );

    expect(
      screen.queryByText("Placement Rule Violations Detected")
    ).not.toBeInTheDocument();
  });

  it("renders dialog with title when open", () => {
    render(
      <ViolationAlertDialog
        open={true}
        onClose={vi.fn()}
        violations={mockViolations}
      />
    );

    expect(screen.getByText("Rule Violations Detected")).toBeInTheDocument();
  });

  it("renders alert with info severity", () => {
    render(
      <ViolationAlertDialog
        open={true}
        onClose={vi.fn()}
        violations={mockViolations}
      />
    );

    expect(
      screen.getByText("Placement Rule Violations Detected")
    ).toBeInTheDocument();
    expect(screen.getByText(/re-intaking these palettes/i)).toBeInTheDocument();
  });

  it("renders violations in table with all columns", () => {
    render(
      <ViolationAlertDialog
        open={true}
        onClose={vi.fn()}
        violations={mockViolations}
      />
    );

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Palettier")).toBeInTheDocument();
    expect(within(dialog).getByText("Position")).toBeInTheDocument();
    expect(within(dialog).getByText("Product")).toBeInTheDocument();
    expect(within(dialog).getByText("Rule")).toBeInTheDocument();
    expect(within(dialog).getByText("Reason")).toBeInTheDocument();
  });

  it("renders violation data rows", () => {
    render(
      <ViolationAlertDialog
        open={true}
        onClose={vi.fn()}
        violations={mockViolations}
      />
    );

    expect(screen.getByText("Rack A1")).toBeInTheDocument();
    expect(screen.getByText("Rack B2")).toBeInTheDocument();
    expect(screen.getByText("Organic Flour 25kg")).toBeInTheDocument();
    expect(screen.getByText("Frozen Fish")).toBeInTheDocument();
    expect(screen.getByText("Max Height Rule")).toBeInTheDocument();
    expect(screen.getByText("Cold Storage Zone")).toBeInTheDocument();
    expect(screen.getByText("(0, 1, 3)")).toBeInTheDocument();
    expect(screen.getByText("(1, 0, 0)")).toBeInTheDocument();
  });

  it("calls onClose when OK button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ViolationAlertDialog
        open={true}
        onClose={onClose}
        violations={mockViolations}
      />
    );

    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when close icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ViolationAlertDialog
        open={true}
        onClose={onClose}
        violations={mockViolations}
      />
    );

    await user.click(screen.getByRole("button", { name: "close" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders empty table when no violations", () => {
    render(
      <ViolationAlertDialog open={true} onClose={vi.fn()} violations={[]} />
    );

    expect(
      screen.getByText("Placement Rule Violations Detected")
    ).toBeInTheDocument();

    const rows = screen.queryAllByRole("row");
    expect(rows).toHaveLength(1);
  });
});
