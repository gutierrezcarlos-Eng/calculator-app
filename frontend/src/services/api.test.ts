import { describe, it, expect, vi, afterEach } from "vitest";
import { calculate } from "./api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockClear();
});

describe("calculate API", () => {
  it("calls the correct URL and returns result", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 42 }),
    });

    const result = await calculate("add", 10, 32);
    expect(result).toBe(42);
    // The URL should now be /api/v1/add?operand1=10&operand2=32
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/add?operand1=10&operand2=32",
    );
  });

  it("throws an error when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "division by zero" }),
    });

    await expect(calculate("divide", 1, 0)).rejects.toThrow("division by zero");
  });

  it("uses the default API base when env not set", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 5 }),
    });

    await calculate("add", 2, 3);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/add?operand1=2&operand2=3",
    );
  });

  it("uses default error message when response has no error field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(calculate("add", 1, 1)).rejects.toThrow("Calculation failed");
  });

  it("calls the sqrt URL with only operand1", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 3 }),
    });

    const result = await calculate("sqrt", 9);
    expect(result).toBe(3);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/sqrt?operand1=9",
    );
  });
});
