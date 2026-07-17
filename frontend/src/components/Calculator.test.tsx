/// <reference types="vitest/globals" />
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calculator } from "./Calculator";
import * as api from "../services/api";
import { vi } from "vitest";
import type { Mock } from "vitest";
import { act } from "react";

vi.mock("../services/api", () => ({
  calculate: vi.fn(),
}));

describe("Calculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Keyboard support", () => {
    const triggerKey = (key: string) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true });
      const calc = document.querySelector(".calculator") as HTMLElement;
      act(() => {
        if (calc) calc.dispatchEvent(event);
        else document.dispatchEvent(event);
      });
    };

    beforeEach(() => {
      render(<Calculator />);
      const calc = document.querySelector(".calculator") as HTMLElement;
      if (calc) calc.focus();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("digit key inserts number", () => {
      triggerKey("3");
      expect(screen.getByTestId("display")).toHaveTextContent("3");
    });

    it("operator + triggers addition", async () => {
      (api.calculate as Mock).mockResolvedValueOnce(15);
      triggerKey("5");
      triggerKey("+");
      expect(screen.getByTestId("display")).toHaveTextContent("5");
      triggerKey("1");
      triggerKey("0");
      triggerKey("Enter");
      await waitFor(() => {
        expect(api.calculate).toHaveBeenCalledWith("add", 5, 10);
        expect(screen.getByTestId("display")).toHaveTextContent("15");
      });
    });

    it("* triggers multiply", () => {
      triggerKey("2");
      triggerKey("*");
      expect(document.querySelector(".expression")).toHaveTextContent("2 ×");
    });

    it("- triggers subtract", () => {
      triggerKey("8");
      triggerKey("-");
      expect(document.querySelector(".expression")).toHaveTextContent("8 −");
    });

    it("/ triggers divide", () => {
      triggerKey("6");
      triggerKey("/");
      expect(document.querySelector(".expression")).toHaveTextContent("6 ÷");
    });

    it("% triggers percent", () => {
      triggerKey("7");
      triggerKey("%");
      expect(document.querySelector(".expression")).toHaveTextContent("7 %");
    });

    it("Backspace removes digit", () => {
      triggerKey("9");
      triggerKey("1");
      triggerKey("Backspace");
      expect(screen.getByTestId("display")).toHaveTextContent("9");
    });

    it("Delete clears entry", () => {
      triggerKey("5");
      triggerKey("+");
      triggerKey("2");
      triggerKey("Delete");
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });

    it("Escape clears all", () => {
      triggerKey("9");
      triggerKey("Escape");
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });

    it("c key clears", () => {
      triggerKey("3");
      triggerKey("c");
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });

    it("^ triggers pow", () => {
      triggerKey("4");
      triggerKey("^");
      expect(document.querySelector(".expression")).toHaveTextContent("4 ^");
    });

    it("r triggers sqrt", async () => {
      (api.calculate as Mock).mockResolvedValueOnce(4);
      triggerKey("1");
      triggerKey("6");
      triggerKey("r");
      await waitFor(() => {
        expect(api.calculate).toHaveBeenCalledWith("sqrt", 16);
      });
    });

    it("n toggles sign", () => {
      triggerKey("5");
      triggerKey("n");
      expect(screen.getByTestId("display")).toHaveTextContent("-5");
      triggerKey("n");
      expect(screen.getByTestId("display")).toHaveTextContent("5");
    });

    it("ignores unknown keys", () => {
      triggerKey("x");
      expect(screen.getByTestId("display")).toHaveTextContent("0");
    });

    it("period key triggers dot input", () => {
      triggerKey("5");
      triggerKey(".");
      triggerKey("2");
      expect(screen.getByTestId("display")).toHaveTextContent("5.2");
    });

    it("ignores keys when focus is on input element", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();
      const event = new KeyboardEvent("keydown", { key: "5", bubbles: true });
      input.dispatchEvent(event);
      // Display should remain 0 because event target is input
      expect(screen.getByTestId("display")).toHaveTextContent("0");
      document.body.removeChild(input);
    });
  });

  it("renders display and buttons", () => {
    render(<Calculator />);
    expect(screen.getByTestId("display")).toHaveTextContent("0");
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("=")).toBeInTheDocument();
  });

  it("inputs digits and shows on display", async () => {
    render(<Calculator />);
    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("2"));
    expect(screen.getByTestId("display")).toHaveTextContent("12");
  });

  it("performs addition via API", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(42);
    render(<Calculator />);
    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("add", 10, 32);
      expect(screen.getByTestId("display")).toHaveTextContent("42");
    });
  });

  it("displays error on API failure", async () => {
    (api.calculate as Mock).mockRejectedValueOnce(
      new Error("division by zero"),
    );
    render(<Calculator />);
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("÷")); // was '/'
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent(
        "division by zero",
      );
      expect(document.querySelector(".expression")).toHaveTextContent(
        "5 ÷ 0 = Error",
      );
    });
  });

  it("clears display and state", async () => {
    render(<Calculator />);
    await userEvent.click(screen.getByText("9"));
    await userEvent.click(screen.getByText("C"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("backspace removes last digit", async () => {
    render(<Calculator />);
    // Type 123
    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("3"));
    expect(screen.getByTestId("display")).toHaveTextContent("123");

    // Press backspace (←)
    await userEvent.click(screen.getByText("←"));
    expect(screen.getByTestId("display")).toHaveTextContent("12");

    // Backspace again
    await userEvent.click(screen.getByText("←"));
    expect(screen.getByTestId("display")).toHaveTextContent("1");

    // Backspace on single digit → 0
    await userEvent.click(screen.getByText("←"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("starts a fresh calculation after pressing equals", async () => {
    // Mock addition: 5 + 3 = 8
    (api.calculate as Mock).mockResolvedValueOnce(8);
    render(<Calculator />);

    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });

    // After =, pressing a digit starts a new number (not appending to 8)
    await userEvent.click(screen.getByText("4"));
    expect(screen.getByTestId("display")).toHaveTextContent("4");
  });

  it("handles square root (sqrt) correctly", async () => {
    // Mock sqrt API: sqrt(9) = 3
    (api.calculate as Mock).mockResolvedValueOnce(3);
    render(<Calculator />);

    await userEvent.click(screen.getByText("9"));
    await userEvent.click(screen.getByText("√")); // the sqrt button

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("sqrt", 9);
      expect(screen.getByTestId("display")).toHaveTextContent("3");
    });
  });

  it("handles percentage via % button", async () => {
    // Percent is treated as operator: 20% of 50 = 10
    (api.calculate as Mock).mockResolvedValueOnce(10);
    render(<Calculator />);

    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByText("%"));
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("percent", 20, 50);
      expect(screen.getByTestId("display")).toHaveTextContent("10");
    });
  });

  it("clearEntry (CE) resets display but keeps operator", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(7);
    render(<Calculator />);

    // 2 + 3
    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    expect(screen.getByTestId("display")).toHaveTextContent("3");

    // Press CE – should clear current entry to 0
    await userEvent.click(screen.getByText("CE"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");

    // Type 5 and press = (should compute 2 + 5)
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("add", 2, 5);
      expect(screen.getByTestId("display")).toHaveTextContent("7");
    });
  });

  it("backspace when waiting for second operand clears to 0", async () => {
    render(<Calculator />);
    // 5 +
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("+"));
    // Now we're in waitingForSecond mode; press backspace – should clear the pending 0 and show 0
    await userEvent.click(screen.getByText("←"));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  // ========== DOT (.) TESTS ==========
  it("handles dot input normally", async () => {
    render(<Calculator />);
    // Type 1.2
    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("."));
    await userEvent.click(screen.getByText("2"));
    expect(screen.getByTestId("display")).toHaveTextContent("1.2");
  });

  it("handles dot after a fresh start (after equals)", async () => {
    // Mock 5+3=8, then press dot
    (api.calculate as Mock).mockResolvedValueOnce(8);
    render(<Calculator />);
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("="));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });

    // Fresh start: press dot → should become "0."
    await userEvent.click(screen.getByText("."));
    expect(screen.getByTestId("display")).toHaveTextContent("0.");
  });

  it("handles dot while waiting for second operand", async () => {
    render(<Calculator />);
    // 5 + .
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("+"));
    // Now waitingForSecond: pressing dot resets to "0."
    await userEvent.click(screen.getByText("."));
    expect(screen.getByTestId("display")).toHaveTextContent("0.");
  });

  // ========== OPERATOR CHAINING TEST ==========
  it("chains pending operation when second operator pressed", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(5);
    render(<Calculator />);

    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("×"));

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("add", 2, 3);
      expect(screen.getByTestId("display")).toHaveTextContent("5");
      expect(document.querySelector(".expression")).toHaveTextContent(/5\s*×/);
    });
  });

  // ========== POWER (x^y) TEST ==========
  it("handles power operation and displays superscript expression", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(8);
    render(<Calculator />);

    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByTestId("pow")); // <-- using test id
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("pow", 2, 3);
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });
  });

  it("displays error on sqrt of negative number", async () => {
    // Mock sqrt API to reject with an error (e.g., sqrt(-1))
    (api.calculate as Mock).mockRejectedValueOnce(
      new Error("square root of negative number"),
    );
    render(<Calculator />);

    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("√")); // sqrt(1) – but the mock will reject

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent(
        "square root of negative number",
      );
      expect(document.querySelector(".expression")).toHaveTextContent(
        "√(1) = Error",
      );
    });
  });

  it("does nothing when equals is pressed without operator", async () => {
    render(<Calculator />);
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("="));
    // Display stays 5, no API call
    expect(screen.getByTestId("display")).toHaveTextContent("5");
  });

  it("negates the current number", async () => {
    render(<Calculator />);
    await userEvent.click(screen.getByText("1"));
    await userEvent.click(screen.getByText("2"));
    // Now display shows "12"
    await userEvent.click(screen.getByText("±"));
    expect(screen.getByTestId("display")).toHaveTextContent("-12");
    // Toggle again back to positive
    await userEvent.click(screen.getByText("±"));
    expect(screen.getByTestId("display")).toHaveTextContent("12");
  });

  it("does not allow more than 16 digits", async () => {
    render(<Calculator />);
    // Type 16 digits (e.g., "1234567890123456")
    const digits = "1234567890123456".split("");
    for (const d of digits) {
      await userEvent.click(screen.getByText(d));
    }
    // Now try to add one more digit
    await userEvent.click(screen.getByText("7"));
    // Display should still have 16 digits (the same string)
    expect(screen.getByTestId("display")).toHaveTextContent("1234567890123456");
  });

  it("negate toggles second operand sign correctly", async () => {
    // 2 * 5 = 10, mock returns -5 for fun, but we expect 2 * 5
    (api.calculate as Mock).mockResolvedValueOnce(-5);
    render(<Calculator />);
    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByText("×"));
    // now waiting for second operand; press ± does nothing (stays "0")
    await userEvent.click(screen.getByText("±"));
    expect(screen.getByTestId("display")).toHaveTextContent("-");
    await userEvent.click(screen.getByText("5"));
    expect(screen.getByTestId("display")).toHaveTextContent("-5");
    await userEvent.click(screen.getByText("="));
    await waitFor(() => {
      expect(api.calculate).toHaveBeenCalledWith("multiply", 2, -5);
      expect(screen.getByTestId("display")).toHaveTextContent("-5"); // mock result
    });
  });

  it("displays division by zero expression and clears on next operation", async () => {
    (api.calculate as Mock).mockRejectedValueOnce(
      new Error("division by zero"),
    );
    render(<Calculator />);
    await userEvent.click(screen.getByText("8"));
    await userEvent.click(screen.getByText("÷"));
    await userEvent.click(screen.getByText("0"));
    await userEvent.click(screen.getByText("="));

    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent(
        "division by zero",
      );
      // the expression should show the attempt
      expect(document.querySelector(".expression")).toHaveTextContent(
        "8 ÷ 0 = Error",
      );
    });

    // start a new operation
    await userEvent.click(screen.getByText("5"));
    expect(screen.getByTestId("display")).toHaveTextContent("5");
  });

  it("negate toggles sign off when display is minus (waitingForSecond)", async () => {
    render(<Calculator />);
    // 5 ×
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    // now waitingForSecond = true, display shows "5"
    // press ± to show a leading minus
    await userEvent.click(screen.getByRole("button", { name: "±" }));
    expect(screen.getByTestId("display")).toHaveTextContent("-");
    // press ± again to toggle back to '0'
    await userEvent.click(screen.getByRole("button", { name: "±" }));
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("sqrt overflow shows Overflow error", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(1.2345678901234567e50);
    render(<Calculator />);
    await userEvent.click(screen.getByRole("button", { name: "9" }));
    await userEvent.click(screen.getByRole("button", { name: "√" }));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("Overflow");
      expect(document.querySelector(".expression")).toHaveTextContent(
        "√(9) = Overflow",
      );
    });
  });

  it("binary operation overflow shows Overflow error", async () => {
    // Mock pow to return a number with >16 digits
    (api.calculate as Mock).mockResolvedValueOnce(1.2345678901234567e50);
    render(<Calculator />);
    await userEvent.click(screen.getByText("2"));
    await userEvent.click(screen.getByTestId("pow"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("="));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("Overflow");
      expect(document.querySelector(".expression")).toHaveTextContent(
        "2³ = Overflow",
      );
    });
  });

  it("equals clears operator and firstOperand", async () => {
    // After equals, the hook should reset firstOperand and operator
    (api.calculate as Mock).mockResolvedValueOnce(8);
    render(<Calculator />);
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("+"));
    await userEvent.click(screen.getByText("3"));
    await userEvent.click(screen.getByText("="));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("8");
    });
    // Press another operator – it should start fresh (no chaining)
    await userEvent.click(screen.getByText("+"));
    // Display should show 8 (the result) as first operand, not a chain
    expect(screen.getByTestId("display")).toHaveTextContent("8");
    expect(document.querySelector(".expression")).toHaveTextContent(/8\s*\+/);
  });

  it("ignores keys when focus is on input element", () => {
    // Need the calculator mounted
    render(<Calculator />);

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    // Dispatch on the input – the handler will see e.target as the input
    const event = new KeyboardEvent("keydown", { key: "5", bubbles: true });
    input.dispatchEvent(event);

    // The calculator should NOT have processed the key (display stays "0")
    expect(screen.getByTestId("display")).toHaveTextContent("0");

    document.body.removeChild(input);
  });

  it("negate toggles sign off when display is minus (waitingForSecond)", async () => {
    render(<Calculator />);
    await userEvent.click(screen.getByText("5"));
    await userEvent.click(screen.getByText("×"));
    // waitingForSecond true, display shows "5" (first operand), not "0"
    await userEvent.click(screen.getByText("±")); // shows '-'
    expect(screen.getByTestId("display")).toHaveTextContent("-");
    await userEvent.click(screen.getByText("±")); // toggles back to '0'
    expect(screen.getByTestId("display")).toHaveTextContent("0");
  });

  it("sqrt overflow with huge number shows Overflow", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(1.2345678901234567e50); // 1.2345678901234567e+50 -> '1.2345678901234567e+50' length 22
    render(<Calculator />);
    await userEvent.click(screen.getByText("9"));
    await userEvent.click(screen.getByText("√"));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("Overflow");
      expect(document.querySelector(".expression")).toHaveTextContent(
        "√(9) = Overflow",
      );
    });
  });

  it("chaining with a tiny number shows formatted expression", async () => {
    (api.calculate as Mock).mockResolvedValueOnce(0.000000194);
    render(<Calculator />);
    // Perform a calculation that yields 0.000000194 (mock)
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    await userEvent.click(screen.getByRole("button", { name: "÷" }));
    // type 5150000 (or any sequence) - we just mock the result, it doesn't matter
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    await userEvent.click(screen.getByRole("button", { name: "=" }));
    await waitFor(() =>
      expect(screen.getByTestId("display")).toHaveTextContent("0.000000194"),
    );

    // Chain another operator (×)
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    await waitFor(() => {
      expect(document.querySelector(".expression")).toHaveTextContent(
        "0.000000194 ×",
      );
    });
  });
  it("formats very small number in expression on fresh operator press", async () => {
    render(<Calculator />);
    // Type 0.000000000001 (12 digits after decimal)
    await userEvent.click(screen.getByRole("button", { name: "0" }));
    await userEvent.click(screen.getByRole("button", { name: "." }));
    // type 11 zeros, then 1
    for (let i = 0; i < 11; i++) {
      await userEvent.click(screen.getByRole("button", { name: "0" }));
    }
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    expect(screen.getByTestId("display")).toHaveTextContent("0.000000000001");

    // Press operator
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(document.querySelector(".expression")).toHaveTextContent(
      "0.000000000001 ×",
    );
  });

  it("negate on zero shows a minus sign placeholder", async () => {
    render(<Calculator />);
    // Display is "0"
    await userEvent.click(screen.getByRole("button", { name: "±" }));
    // Should change to a minus sign, not "-0"
    expect(screen.getByTestId("display")).toHaveTextContent("-");
    // Press a digit -> it becomes negative
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(screen.getByTestId("display")).toHaveTextContent("-5");
  });

  it("addition overflow shows Overflow expression", async () => {
    // Mock a huge result that overflows the display (length > 16)
    (api.calculate as Mock).mockResolvedValueOnce(1.2345678901234567e30);
    render(<Calculator />);
    await userEvent.click(screen.getByRole("button", { name: "1" }));
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    await userEvent.click(screen.getByRole("button", { name: "=" }));
    await waitFor(() => {
      expect(screen.getByTestId("display")).toHaveTextContent("Overflow");
      expect(document.querySelector(".expression")).toHaveTextContent(
        "1 + 2 = Overflow",
      );
    });
  });

  it("shows error expression for addition failure", async () => {
    (api.calculate as Mock).mockRejectedValueOnce(
      new Error("something went wrong"),
    );
    render(<Calculator />);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    await userEvent.click(screen.getByRole("button", { name: "4" }));
    await userEvent.click(screen.getByRole("button", { name: "=" }));

    await waitFor(() => {
      expect(document.querySelector(".expression")).toHaveTextContent(
        "3 + 4 = Error",
      );
    });
  });

  it("shows superscript error expression for pow failure", async () => {
    (api.calculate as Mock).mockRejectedValueOnce(new Error("some error"));
    render(<Calculator />);
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    await userEvent.click(screen.getByTestId("pow"));
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    await userEvent.click(screen.getByRole("button", { name: "=" }));

    await waitFor(() => {
      expect(document.querySelector(".expression")).toHaveTextContent(
        "2³ = Error",
      );
    });
  });
});
