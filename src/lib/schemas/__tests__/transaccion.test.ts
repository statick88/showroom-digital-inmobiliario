import { describe, it, expect } from "vitest";
import { registrarTransaccionSchema, type RegistrarTransaccion } from "@/lib/schemas/transaccion";

const VALID_LOTE_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_VENDEDOR_ID = "660e8400-e29b-41d4-a716-446655440000";
const VALID_CCI = "002-123456789012345678";

describe("transaccion schemas — HU-008 + spec #2668", () => {
  it("(1) accepts a valid complete transaction (happy path)", () => {
    const payload: RegistrarTransaccion = {
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Carlos Mamani",
      compradorDocumento: "12345678",
      compradorEmail: "carlos@example.com",
      compradorTelefono: "+51987654321",
      monto: 1500.5,
      moneda: "PEN",
      idVendedor: VALID_VENDEDOR_ID,
      metodoPago: "yape",
      cci: VALID_CCI,
      notas: "Cliente referido por María",
    };
    const result = registrarTransaccionSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monto).toBe(1500.5);
      expect(result.data.moneda).toBe("PEN");
    }
  });

  it("(2) accepts a minimal valid transaction (boundary — optional fields omitted)", () => {
    const payload = {
      loteId: VALID_LOTE_ID,
      tipo: "venta" as const,
      compradorNombre: "Ana Torres",
      monto: 100,
      moneda: "USD" as const,
    };
    const result = registrarTransaccionSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      // Optional fields default
      expect(result.data.idVendedor).toBeUndefined();
      expect(result.data.cci).toBeUndefined();
    }
  });

  it("(3) rejects a negative monto (boundary — money must be positive)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: -100,
      moneda: "PEN",
    });
    expect(result.success).toBe(false);
  });

  it("(4) rejects a monto with more than 2 decimals (boundary)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: 100.123,
      moneda: "PEN",
    });
    expect(result.success).toBe(false);
  });

  it("(5) rejects a NaN monto (boundary — no NaN)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: Number.NaN,
      moneda: "PEN",
    });
    expect(result.success).toBe(false);
  });

  it("(6) rejects an invalid metodoPago (boundary)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: 100,
      moneda: "PEN",
      metodoPago: "bitcoin",
    });
    expect(result.success).toBe(false);
  });

  it("(7) rejects a malformed CCI on the transaccion (boundary)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: 100,
      moneda: "PEN",
      cci: "002-123",
    });
    expect(result.success).toBe(false);
  });

  it("(8) rejects extra fields (strict mode)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: 100,
      moneda: "PEN",
      extraField: "rejected",
    });
    expect(result.success).toBe(false);
  });

  it("(9) rejects a string where a number is expected for monto (type error)", () => {
    const result = registrarTransaccionSchema.safeParse({
      loteId: VALID_LOTE_ID,
      tipo: "reserva",
      compradorNombre: "Test",
      monto: "1500" as unknown as number,
      moneda: "PEN",
    });
    expect(result.success).toBe(false);
  });
});
