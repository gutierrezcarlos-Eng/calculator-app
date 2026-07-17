import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

// Component that throws an error when rendered
const Bomb = () => {
  throw new Error("test error");
};

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("catches error and displays fallback", () => {
    // Suppress error output during test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    // The fallback message should be shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
