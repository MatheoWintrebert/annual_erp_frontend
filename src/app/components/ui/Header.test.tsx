import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

vi.mock("../../context/CompanySettingsContext", () => ({
  useCompanySettings: () => ({
    settings: null,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

const renderHeader = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Header />
    </MemoryRouter>
  );

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderHeader();
    expect(screen.getByText("Annual ERP")).toBeInTheDocument();
  });

  it('displays "Dashboard", "Intake", and "Pick" as primary nav items', () => {
    renderHeader();
    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /intake/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pick/i })).toBeInTheDocument();
  });

  it('does not display "Sell" in navigation', () => {
    renderHeader();
    expect(
      screen.queryByRole("link", { name: /sell/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sell/i })
    ).not.toBeInTheDocument();
  });

  it('does not display "Palettes" in Setup dropdown', async () => {
    const user = userEvent.setup();
    renderHeader();

    const setupButton = screen.getByRole("button", { name: /setup/i });
    await user.click(setupButton);

    const menu = screen.getByRole("menu");
    expect(within(menu).queryByText(/palettes/i)).not.toBeInTheDocument();
  });

  it("displays Setup dropdown with Custom, Palettier, Rules, Products", async () => {
    const user = userEvent.setup();
    renderHeader();

    const setupButton = screen.getByRole("button", { name: /setup/i });
    await user.click(setupButton);

    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("Custom")).toBeInTheDocument();
    expect(within(menu).getByText("Palettier")).toBeInTheDocument();
    expect(within(menu).getByText("Rules")).toBeInTheDocument();
    expect(within(menu).getByText("Products")).toBeInTheDocument();
  });
});
