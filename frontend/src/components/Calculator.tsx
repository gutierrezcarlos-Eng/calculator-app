import { useRef } from "react";
import { useCalculator } from "../hooks/useCalculator";
import { useKeyboard } from "../hooks/useKeyboard";
import { Display } from "./Display";
import { ButtonPanel } from "./ButtonPanel";

export function Calculator() {
  const calc = useCalculator();

  const containerRef = useRef<HTMLDivElement>(null);

  useKeyboard(containerRef, {
    inputDigit: calc.inputDigit,
    inputDot: calc.inputDot,
    clear: calc.clear,
    clearEntry: calc.clearEntry,
    backspace: calc.backspace,
    negate: calc.negate,
    handleOperator: calc.handleOperator,
    handleEquals: calc.handleEquals,
    handlePercent: calc.handlePercent,
    handleSqrt: calc.handleSqrt,
  });

  return (
    <div
      ref={containerRef}
      className="calculator"
      tabIndex={0}
      style={{ outline: "none" }}
    >
      <Display
        expression={calc.expression}
        display={calc.display}
        error={calc.error}
      />
      <ButtonPanel
        onDigit={calc.inputDigit}
        onDot={calc.inputDot}
        onClear={calc.clear}
        onClearEntry={calc.clearEntry}
        onBackspace={calc.backspace}
        onNegate={calc.negate}
        onOperator={calc.handleOperator}
        onEquals={calc.handleEquals}
        onPercent={calc.handlePercent}
        onSqrt={calc.handleSqrt}
      />
    </div>
  );
}
