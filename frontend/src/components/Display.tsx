interface DisplayProps {
  expression: string;
  display: string;
  error: string | null;
}

export function Display({ expression, display, error }: DisplayProps) {
  // Base font size for current value (2em). Reduce when length > 10 characters.
  const length = display.length;
  const baseSize = 2; // em
  const scale =
    length > 10 ? Math.max(1, baseSize - (length - 10) * 0.1) : baseSize;

  return (
    <div className="display">
      <div className="expression">{expression || "\u00A0"}</div>
      <div
        className="current"
        data-testid="display"
        style={{ fontSize: `${scale}em` }}
      >
        {error ? <span className="error">{error}</span> : display}
      </div>
    </div>
  );
}
