import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import Header from "./Header";

vi.mock("../../context/CompanySettingsContext", () => ({
  useCompanySettings: () => ({
    settings: null,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

const authenticatedState = {
  auth: {
    isAuthenticated: true,
    token: "tok",
    qrCode: null,
    identityToken: null,
    showStillHere: false,
  },
};

const renderHeader = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    </Provider>
  );

const renderHeaderAuthenticated = () =>
  render(
    <Provider store={makeStore(authenticatedState)}>
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    </Provider>
  );

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderHeader();
    expect(screen.getByText("PMS")).toBeInTheDocument();
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

  it("shows Login button when not authenticated", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /logout/i })
    ).not.toBeInTheDocument();
  });

  it("shows Logout button when authenticated", () => {
    renderHeaderAuthenticated();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /login/i })
    ).not.toBeInTheDocument();
  });

  it("clicking Logout navigates to /signin", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={makeStore(authenticatedState)}>
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="*" element={<Header />} />
            <Route path="/signin" element={<div data-testid="signin-page" />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByTestId("signin-page")).toBeInTheDocument();
  });
});
