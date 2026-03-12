import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import ProtectedRoute from "./ProtectedRoute";

const authenticatedState = {
  auth: {
    isAuthenticated: true,
    token: "test-token",
    qrCode: null,
    identityToken: null,
    showStillHere: false,
  },
};

describe("ProtectedRoute", () => {
  it("redirects unauthenticated user to /signin", () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<div>Protected content</div>} />
            </Route>
            <Route path="/signin" element={<div>signin</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("signin")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders outlet content for authenticated user", () => {
    render(
      <Provider store={makeStore(authenticatedState)}>
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<div>Protected content</div>} />
            </Route>
            <Route path="/signin" element={<div>signin</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(screen.queryByText("signin")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated user to /signin when accessing /app", () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter initialEntries={["/app"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<div>App content</div>} />
            </Route>
            <Route path="/signin" element={<div>signin</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("signin")).toBeInTheDocument();
    expect(screen.queryByText("App content")).not.toBeInTheDocument();
  });
});
