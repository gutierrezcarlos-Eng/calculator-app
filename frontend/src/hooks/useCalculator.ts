import { useState, useCallback } from "react";
import { calculate } from "../services/api";

type Operation = "add" | "subtract" | "multiply" | "divide" | "pow" | "percent";

const operatorSymbols: Record<string, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
  pow: "^",
  percent: "%",
  sqrt: "√",
};

const superscriptDigits: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  ".": "·",
};

const MAX_DIGITS = 16;
const MAX_DISPLAY_LENGTH = 16;

function toSuperscript(n: number): string {
  return String(n)
    .split("")
    .map((ch) => superscriptDigits[ch] || ch)
    .join("");
}

function getFiniteNumber(str: string): number | null {
  const num = parseFloat(str);
  if (!isFinite(num)) return null;
  return num;
}

function formatResult(num: number): string {
  // Convert to fixed decimal with up to 12 places, then strip trailing zeros.
  let str = num.toFixed(12);
  // Remove trailing zeros after decimal (keep at least one digit if needed)
  str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
  // Remove decimal point if all zeros after it
  str = str.replace(/\.0+$/, "");
  return str;
}

export function useCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operation | null>(null);
  const [waitingForSecond, setWaitingForSecond] = useState(false);
  const [shouldStartFresh, setShouldStartFresh] = useState(false);

  const clear = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setError(null);
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecond(false);
    setShouldStartFresh(false);
  }, []);

  const clearEntry = useCallback(() => {
    setError(null);
    setDisplay("0");
  }, []);

  const backspace = useCallback(() => {
    setError(null);
    if (waitingForSecond) {
      setDisplay("0");
      return;
    }
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  }, [waitingForSecond]);

  const negate = useCallback(() => {
    setError(null);
    if (waitingForSecond) {
      // Toggle a leading minus sign for the upcoming second operand.
      if (display === "-") {
        setDisplay("0");
      } else {
        setDisplay("-");
      }
    } else {
      setDisplay((prev) => {
        if (prev === "0") {
          return "-";
        }
        if (prev.startsWith("-")) {
          return prev.slice(1);
        }
        return "-" + prev;
      });
    }
    setShouldStartFresh(false);
  }, [display, waitingForSecond]);

  const inputDigit = useCallback(
    (digit: string) => {
      setError(null);
      if (shouldStartFresh) {
        setShouldStartFresh(false);
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
        setDisplay(digit);
        return;
      }
      // If the display is only a minus sign, we're starting a negative number.
      if (display === "-") {
        setDisplay("-" + digit);
        setWaitingForSecond(false); // no longer waiting for second operand
        return;
      }
      if (waitingForSecond) {
        // Replace the currently shown number (the first operand) with the new digit.
        setDisplay(digit);
        setWaitingForSecond(false);
        return;
      }
      if (display.replace("-", "").length >= MAX_DIGITS) return;
      setDisplay((prev) => (prev === "0" ? digit : prev + digit));
    },
    [waitingForSecond, shouldStartFresh, display],
  );

  const inputDot = useCallback(() => {
    setError(null);
    if (shouldStartFresh) {
      setShouldStartFresh(false);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecond(false);
      setDisplay("0.");
      return;
    }
    if (waitingForSecond) {
      setDisplay("0.");
      setWaitingForSecond(false);
      return;
    }
    if (!display.includes(".") && display.length < MAX_DIGITS) {
      setDisplay((prev) => prev + ".");
    }
  }, [display, waitingForSecond, shouldStartFresh]);

  const performUnary = useCallback(
    async (op: "sqrt") => {
      const a = getFiniteNumber(display);
      if (a === null) {
        setError("Overflow");
        setDisplay("0");
        setShouldStartFresh(true);
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
        return;
      }
      try {
        const result = await calculate(op, a);
        const resultStr = formatResult(result);
        if (resultStr.length > MAX_DISPLAY_LENGTH) {
          setError("Overflow");
          setExpression(`√(${a}) = Overflow`);
          setDisplay("0");
          setShouldStartFresh(true);
          setFirstOperand(null);
          setOperator(null);
          setWaitingForSecond(false);
          return;
        }
        setDisplay(resultStr);
        setExpression(`√(${a}) = ${resultStr}`);
        setError(null);
        setShouldStartFresh(true);
      } catch (e: any) {
        setError(e.message);
        setExpression(`√(${a}) = Error`);
        setDisplay("0");
        setShouldStartFresh(true);
      }
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecond(false);
    },
    [display],
  );

  const executeCalculation = useCallback(async (): Promise<number | null> => {
    if (firstOperand === null || operator === null) return null;
    const second = getFiniteNumber(display);
    const formattedFirst = formatResult(firstOperand);
    if (second === null) {
      setError("Overflow");
      setDisplay("0");
      setShouldStartFresh(true);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecond(false);
      return null;
    }
    try {
      const result = await calculate(operator, firstOperand, second);
      const resultStr = formatResult(result);
      if (resultStr.length > MAX_DISPLAY_LENGTH) {
        setError("Overflow");
        const overflowExpr =
          operator === "pow"
            ? `${firstOperand}${toSuperscript(second)} = Overflow`
            : `${firstOperand} ${operatorSymbols[operator]} ${second} = Overflow`;
        setExpression(overflowExpr);
        setDisplay("0");
        setShouldStartFresh(true);
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecond(false);
        return null;
      }
      // Success – update display and expression
      setDisplay(resultStr);
      const expr =
        operator === "pow"
          ? `${formattedFirst}${toSuperscript(second)} = ${resultStr}`
          : `${formattedFirst} ${operatorSymbols[operator]} ${second} = ${resultStr}`;
      setExpression(expr);
      setError(null);
      setShouldStartFresh(true);
      return result; // <-- return the number
    } catch (e: any) {
      setError(e.message);
      const errorExpr =
        operator === "pow"
          ? `${firstOperand}${toSuperscript(second)} = Error`
          : `${firstOperand} ${operatorSymbols[operator]} ${second} = Error`;
      setExpression(errorExpr);
      setDisplay("0");
      setShouldStartFresh(true);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecond(false);
      return null;
    }
  }, [firstOperand, operator, display]);

  const handleOperator = useCallback(
    async (op: Operation) => {
      setError(null);
      const current = getFiniteNumber(display);
      if (current === null) {
        setError("Overflow");
        setDisplay("0");
        return;
      }
      if (firstOperand !== null && operator && !waitingForSecond) {
        const success = await executeCalculation();
        if (success === null) return;

        const formatted = formatResult(success);

        setFirstOperand(success);
        setOperator(op);
        setWaitingForSecond(true);
        setShouldStartFresh(false);
        setDisplay(formatted); // reset for next operand
        setExpression(`${formatted} ${operatorSymbols[op]} `);
        return;
      }

      const formattedCurrent = formatResult(current);
      setFirstOperand(current);
      setOperator(op);
      setWaitingForSecond(true);
      setShouldStartFresh(false);
      setExpression(`${formattedCurrent} ${operatorSymbols[op]} `);
    },
    [display, firstOperand, operator, waitingForSecond, executeCalculation],
  );

  const handleEquals = useCallback(() => {
    if (firstOperand !== null && operator) {
      executeCalculation();
      // After equals we want to clear the operator/operand so the display doesn't keep the pending state.
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecond(false);
    }
  }, [firstOperand, operator, executeCalculation]);

  const handlePercent = useCallback(() => {
    handleOperator("percent");
  }, [handleOperator]);

  const handleSqrt = useCallback(() => {
    performUnary("sqrt");
  }, [performUnary]);

  return {
    display,
    expression,
    error,
    inputDigit,
    inputDot,
    clear,
    clearEntry,
    backspace,
    negate,
    handleOperator,
    handleEquals,
    handlePercent,
    handleSqrt,
  };
}
