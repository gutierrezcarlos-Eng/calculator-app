const API_BASE = import.meta.env.VITE_API_BASE;
const API_PREFIX = import.meta.env.VITE_API_PREFIX;

type BinaryOp = "add" | "subtract" | "multiply" | "divide" | "pow" | "percent";

export async function calculate(
  operator: BinaryOp | "sqrt",
  operand1: number,
  operand2?: number,
): Promise<number> {
  let url: string;

  if (operator === "sqrt") {
    url = `${API_BASE}${API_PREFIX}/sqrt?operand1=${operand1}`;
  } else {
    // operand2 must be provided for binary operations
    url = `${API_BASE}${API_PREFIX}/${operator}?operand1=${operand1}&operand2=${operand2}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Calculation failed");
  }
  return data.result;
}
