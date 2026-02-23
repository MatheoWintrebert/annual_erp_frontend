import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SnackbarProvider, { useSnackbar } from "./SnackbarProvider";

const SnackbarTrigger = ({ message }: { message: string }) => {
  const { showSnackbar } = useSnackbar();
  return (
    <button
      onClick={() => {
        showSnackbar(message, "success");
      }}
    >
      Show Snackbar
    </button>
  );
};

describe("SnackbarProvider", () => {
  it("renders children correctly", () => {
    render(
      <SnackbarProvider>
        <div>Child content</div>
      </SnackbarProvider>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("displays a snackbar when useSnackbar().showSnackbar is called", () => {
    render(
      <SnackbarProvider>
        <SnackbarTrigger message="Test notification" />
      </SnackbarProvider>
    );

    act(() => {
      screen.getByText("Show Snackbar").click();
    });

    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });
});
