import { render, screen } from "@testing-library/react";
import { ButtonPanel } from "./ButtonPanel";
import { vi } from "vitest";

test("renders all operator buttons", () => {
  const handlers = {
    onDigit: vi.fn(),
    onDot: vi.fn(),
    onClear: vi.fn(),
    onClearEntry: vi.fn(),
    onBackspace: vi.fn(),
    onNegate: vi.fn(),
    onOperator: vi.fn(),
    onEquals: vi.fn(),
    onPercent: vi.fn(),
    onSqrt: vi.fn(),
  };

  render(<ButtonPanel {...handlers} />);

  const powButton = screen.getByTestId("pow");

  // Check all special buttons
  expect(screen.getByText("CE")).toBeInTheDocument();
  expect(screen.getByText("C")).toBeInTheDocument();
  expect(screen.getByText("←")).toBeInTheDocument();
  expect(screen.getByText("√")).toBeInTheDocument();
  expect(screen.getByText("%")).toBeInTheDocument();
  expect(screen.getByText("+")).toBeInTheDocument();
  expect(screen.getByText("−")).toBeInTheDocument();
  expect(screen.getByText("×")).toBeInTheDocument();
  expect(screen.getByText("÷")).toBeInTheDocument();
  expect(screen.getByText(".")).toBeInTheDocument();
  expect(screen.getByText("0")).toBeInTheDocument();
  expect(screen.getByText("=")).toBeInTheDocument();

  // Check power button via test id
  expect(screen.getByTestId("pow")).toBeInTheDocument();

  expect(powButton).toBeInTheDocument();
  expect(powButton.querySelector("sup")).toHaveTextContent("y");
});
