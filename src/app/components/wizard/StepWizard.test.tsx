import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import StepWizard from "./StepWizard";
import type { StepWizardProps } from "./types";

const createSteps = () => [
  { label: "Details", content: <div>Step 1 Content</div> },
  { label: "Review", content: <div>Step 2 Content</div> },
];

const defaultProps: StepWizardProps = {
  steps: createSteps(),
  activeStep: 0,
  onNext: vi.fn(),
  onBack: vi.fn(),
  onConfirm: vi.fn(),
};

describe("StepWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders step labels correctly", () => {
    render(<StepWizard {...defaultProps} />);

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("renders first step content when activeStep is 0", () => {
    render(<StepWizard {...defaultProps} activeStep={0} />);

    expect(screen.getByText("Step 1 Content")).toBeInTheDocument();
    expect(screen.queryByText("Step 2 Content")).not.toBeInTheDocument();
  });

  it("renders second step content when activeStep is 1", () => {
    render(<StepWizard {...defaultProps} activeStep={1} />);

    expect(screen.getByText("Step 2 Content")).toBeInTheDocument();
    expect(screen.queryByText("Step 1 Content")).not.toBeInTheDocument();
  });

  it("calls onNext when Next button is clicked on non-last step", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<StepWizard {...defaultProps} activeStep={0} onNext={onNext} />);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<StepWizard {...defaultProps} activeStep={1} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("disables Back button on first step", () => {
    render(<StepWizard {...defaultProps} activeStep={0} />);

    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });

  it("shows Confirm button on last step instead of Next", () => {
    render(<StepWizard {...defaultProps} activeStep={1} />);

    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next/i })
    ).not.toBeInTheDocument();
  });

  it("calls onConfirm when Confirm button is clicked on last step", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <StepWizard {...defaultProps} activeStep={1} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("shows submitting state with custom label", () => {
    render(
      <StepWizard
        {...defaultProps}
        activeStep={1}
        isSubmitting={true}
        submittingLabel="Creating..."
      />
    );

    expect(screen.getByText("Creating...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
  });

  it("uses custom confirm label", () => {
    render(
      <StepWizard
        {...defaultProps}
        activeStep={1}
        confirmLabel="Save Changes"
      />
    );

    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("disables confirm button when disableConfirm is true", () => {
    render(
      <StepWizard
        {...defaultProps}
        activeStep={1}
        disableConfirm={true}
        disableConfirmReason="Select something first"
      />
    );

    expect(screen.getByRole("button", { name: /confirm/i })).toBeDisabled();
  });

  it("does not call onConfirm when confirm button is disabled", () => {
    const onConfirm = vi.fn();

    render(
      <StepWizard
        {...defaultProps}
        activeStep={1}
        onConfirm={onConfirm}
        disableConfirm={true}
        disableConfirmReason="Select something first"
      />
    );

    const button = screen.getByRole("button", { name: /confirm/i });
    expect(button).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows tooltip with reason when confirm is disabled and hovered", async () => {
    const user = userEvent.setup();

    render(
      <StepWizard
        {...defaultProps}
        activeStep={1}
        disableConfirm={true}
        disableConfirmReason="Select something first"
      />
    );

    const button = screen.getByRole("button", { name: /confirm/i });
    // Hover on the span wrapper (parent) since the disabled button has pointer-events: none
    await user.hover(button.parentElement ?? button);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Select something first"
    );
  });

  it("does not show tooltip when disableConfirm is false", () => {
    render(<StepWizard {...defaultProps} activeStep={1} />);

    expect(screen.getByRole("button", { name: /confirm/i })).toBeEnabled();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
