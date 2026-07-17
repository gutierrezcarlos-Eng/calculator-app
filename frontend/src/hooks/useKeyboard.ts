import { useEffect, useCallback } from "react";

interface KeyboardHandlers {
  inputDigit: (d: string) => void;
  inputDot: () => void;
  clear: () => void;
  clearEntry: () => void;
  backspace: () => void;
  negate: () => void;
  handleOperator: (
    op: "add" | "subtract" | "multiply" | "divide" | "pow",
  ) => void;
  handleEquals: () => void;
  handlePercent: () => void;
  handleSqrt: () => void;
}

export function useKeyboard(
  containerRef: React.RefObject<HTMLElement | null>,
  handlers: KeyboardHandlers,
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "0" && key <= "9") {
        e.preventDefault();
        handlers.inputDigit(key);
        return;
      }
      if (key === ".") {
        e.preventDefault();
        handlers.inputDot();
        return;
      }
      switch (key) {
        case "+":
          e.preventDefault();
          handlers.handleOperator("add");
          break;
        case "-":
          e.preventDefault();
          handlers.handleOperator("subtract");
          break;
        case "*":
          e.preventDefault();
          handlers.handleOperator("multiply");
          break;
        case "/":
          e.preventDefault();
          handlers.handleOperator("divide");
          break;
        case "%":
          e.preventDefault();
          handlers.handlePercent();
          break;
        case "Enter":
        case "=":
          e.preventDefault();
          handlers.handleEquals();
          break;
        case "Backspace":
          e.preventDefault();
          handlers.backspace();
          break;
        case "Delete":
          e.preventDefault();
          handlers.clearEntry();
          break;
        case "Escape":
        case "c":
        case "C":
          e.preventDefault();
          handlers.clear();
          break;
        case "^":
          e.preventDefault();
          handlers.handleOperator("pow");
          break;
        case "r":
        case "R":
          e.preventDefault();
          handlers.handleSqrt();
          break;
        case "n":
        case "N":
          e.preventDefault();
          handlers.negate();
          break;
      }
    },
    [handlers],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("keydown", handleKeyDown);
    container.focus();
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, containerRef]);
}
