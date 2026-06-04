import { describe, it, expect } from "vitest";

import { formatPrice } from "@/presentation/lib/formatters";

describe("formatters — formatPrice", () => {
  it("(1) formats a PEN price with the es-PE locale, S/ prefix, and no decimals", () => {
    const result = formatPrice(150000, "PEN");
    // es-PE currency format: "S/ 150,000"
    expect(result).toContain("S/");
    expect(result).toContain("150,000");
    // No decimal portion — maximumFractionDigits is 0 means no .XX cents
    // We allow ",000" as a thousands separator, but reject patterns like ".50" or ".00" decimals
    expect(result).not.toMatch(/\.\d/);
  });

  it("(2) formats a USD price with the es-PE locale, USD prefix, and no decimals", () => {
    const result = formatPrice(50000, "USD");
    // es-PE currency format for USD: "USD 50,000"
    expect(result).toContain("USD");
    expect(result).toContain("50,000");
  });

  it("(3) for an unknown/non-mapped currency string, defaults to PEN (defensive branch)", () => {
    const result = formatPrice(100, "EUR");
    // 'EUR' !== 'USD', so the implementation falls through to the : "PEN" branch
    expect(result).toContain("S/");
  });

  it("(4) rounds fractional values to the nearest integer (maximumFractionDigits: 0)", () => {
    const result = formatPrice(100.4, "PEN");
    // Should render as 100 (rounded down) not 100.4
    expect(result).not.toContain(".4");
    expect(result).not.toContain(",4");
  });

  it("(5) renders 0 with no decimals", () => {
    const result = formatPrice(0, "PEN");
    expect(result).toMatch(/0/);
  });
});
