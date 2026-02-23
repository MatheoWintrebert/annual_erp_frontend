import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import PlacementStep from "./PlacementStep";
import type { PlacementRecommendation } from "../types";

const mockRecommendation: PlacementRecommendation = {
  palettierId: 1,
  palettierName: "Cold Storage A",
  positionX: 2,
  positionY: 1,
  positionZ: 0,
  reasoning: "Cold storage — space available",
};

describe("PlacementStep", () => {
  it("should render the directive card with placement info", () => {
    render(
      <PlacementStep
        recommendation={mockRecommendation}
        onDone={vi.fn()}
        onRegisterAnother={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(
      screen.getByText("Place in: Cold Storage A, Position (2, 1, 0)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cold storage — space available")
    ).toBeInTheDocument();
  });

  it("should render Done and Register Another buttons", () => {
    render(
      <PlacementStep
        recommendation={mockRecommendation}
        onDone={vi.fn()}
        onRegisterAnother={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Register Another")).toBeInTheDocument();
  });

  it("should call onDone when Done is clicked", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();

    render(
      <PlacementStep
        recommendation={mockRecommendation}
        onDone={onDone}
        onRegisterAnother={vi.fn()}
        isSubmitting={false}
      />
    );

    await user.click(screen.getByText("Done"));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("should call onRegisterAnother when Register Another is clicked", async () => {
    const user = userEvent.setup();
    const onRegisterAnother = vi.fn();

    render(
      <PlacementStep
        recommendation={mockRecommendation}
        onDone={vi.fn()}
        onRegisterAnother={onRegisterAnother}
        isSubmitting={false}
      />
    );

    await user.click(screen.getByText("Register Another"));
    expect(onRegisterAnother).toHaveBeenCalledOnce();
  });

  it("should disable buttons and show loading state when submitting", () => {
    render(
      <PlacementStep
        recommendation={mockRecommendation}
        onDone={vi.fn()}
        onRegisterAnother={vi.fn()}
        isSubmitting={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }

    expect(screen.getAllByText("Registering...")).toHaveLength(2);
  });
});
