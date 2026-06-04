import { describe, it, expect } from "vitest";
import {
  metodoPagoSchema,
  type MetodoPago,
} from "@/lib/schemas/metodo-pago";

describe("metodoPagoSchema — payment method enum (decision #2664)", () => {
  it("(1) accepts every defined payment method (happy path — exhaustive)", () => {
    const allMethods: MetodoPago[] = [
      "yape",
      "plin",
      "transferencia",
      "bcp",
      "interbank",
      "bbva",
      "scotiabank",
      "efectivo",
    ];
    for (const m of allMethods) {
      const result = metodoPagoSchema.safeParse(m);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(m);
      }
    }
  });

  it("(2) rejects an unknown payment method (boundary)", () => {
    const result = metodoPagoSchema.safeParse("bitcoin");
    expect(result.success).toBe(false);
  });

  it("(3) rejects an empty string (boundary)", () => {
    const result = metodoPagoSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("(4) rejects a number where a string is expected (type error)", () => {
    const result = metodoPagoSchema.safeParse(42 as unknown as string);
    expect(result.success).toBe(false);
  });

  it("(5) rejects a case-variant of a valid method (strict case sensitivity)", () => {
    // "Yape" with capital Y is NOT in the enum — payments are stored lowercase.
    const result = metodoPagoSchema.safeParse("Yape");
    expect(result.success).toBe(false);
  });
});
