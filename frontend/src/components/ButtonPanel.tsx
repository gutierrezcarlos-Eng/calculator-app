interface ButtonPanelProps {
  onDigit: (digit: string) => void;
  onDot: () => void;
  onClear: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onNegate: () => void;
  onOperator: (op: "add" | "subtract" | "multiply" | "divide" | "pow") => void;
  onEquals: () => void;
  onPercent: () => void;
  onSqrt: () => void;
}

export function ButtonPanel({
  onDigit,
  onDot,
  onClear,
  onClearEntry,
  onBackspace,
  onNegate,
  onOperator,
  onEquals,
  onPercent,
  onSqrt,
}: ButtonPanelProps) {
  const stringBtn = (label: string, onClick: () => void, className = "") => (
    <button key={label} className={`btn ${className}`} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className="button-panel">
      {/* Row 1: CE, C (wide), ← */}
      {stringBtn("CE", onClearEntry)}
      {stringBtn("C", onClear, "clear wide")}
      {stringBtn("←", onBackspace, "operator")}
      {/* Row 2: √, x^y, %, + */}
      {stringBtn("√", onSqrt, "operator")}
      <button
        key="pow"
        className="btn operator"
        onClick={() => onOperator("pow")}
        data-testid="pow"
      >
        <span>
          x<sup>y</sup>
        </span>
      </button>
      {stringBtn("%", onPercent, "operator")}
      {stringBtn("+", () => onOperator("add"), "operator")}
      {/* Row 3: 7, 8, 9, − */}
      {stringBtn("7", () => onDigit("7"))}
      {stringBtn("8", () => onDigit("8"))}
      {stringBtn("9", () => onDigit("9"))}
      {stringBtn("−", () => onOperator("subtract"), "operator")}
      {/* Row 4: 4, 5, 6, × */}
      {stringBtn("4", () => onDigit("4"))}
      {stringBtn("5", () => onDigit("5"))}
      {stringBtn("6", () => onDigit("6"))}
      {stringBtn("×", () => onOperator("multiply"), "operator")}
      {/* Row 5: 1, 2, 3, ÷ */}
      {stringBtn("1", () => onDigit("1"))}
      {stringBtn("2", () => onDigit("2"))}
      {stringBtn("3", () => onDigit("3"))}
      {stringBtn("÷", () => onOperator("divide"), "operator")}
      {/* Row 6: ±, 0, ., = (all single columns) */}
      {stringBtn("±", onNegate, "operator")}
      {stringBtn("0", () => onDigit("0"))}
      {stringBtn(".", onDot)}
      {stringBtn("=", onEquals, "equals")}
    </div>
  );
}
