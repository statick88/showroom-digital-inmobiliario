import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the supabase implementation of `ITransaccionesRepository`.
 *
 * T-4.5 — verifies the NEW `listarPorVendedor(vendedorId)` method plus
 * the snake_case ↔ camelCase mapping for the transacciones table.
 *
 * Mocking strategy mirrors `supabase-lotes.repository.impl.test.ts`:
 * a fluent chain mock with `from → select → eq → order → then resolve`.
 */

import { transaccionesRepository } from "@/data/repositories/supabase-transacciones.repository.impl";
import type { Transaccion } from "@/domain/entities/lote";

// ── Supabase chain mock ──────────────────────────────────────────────
const fromMock = vi.fn();
const builderMethods: Record<string, ReturnType<typeof vi.fn>> = {};
const chain: Record<string, ReturnType<typeof vi.fn>> = {};

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "t-1",
    lote_id: "l-1",
    tipo: "reserva",
    comprador_nombre: "Juan Pérez",
    comprador_documento: "12345678",
    comprador_email: "juan@example.com",
    comprador_telefono: "+51999000999",
    monto: 50000,
    moneda: "PEN",
    id_vendedor: "v-1",
    notas: null,
    created_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

beforeEach(() => {
  fromMock.mockReset();
  for (const k of Object.keys(builderMethods)) delete builderMethods[k];
  for (const k of Object.keys(chain)) delete chain[k];
});

function makeChain(result: { data: unknown; error: unknown }) {
  const c: Record<string, ReturnType<typeof vi.fn>> = {};
  c.select = vi.fn(() => c);
  c.eq = vi.fn(() => c);
  c.order = vi.fn(() => c);
  c.insert = vi.fn(() => c);
  c.then = vi.fn((resolve) => resolve(result));
  return c;
}

describe("transaccionesRepository.listarPorVendedor (T-4.5)", () => {
  it("(1) queries 'transacciones' with eq('id_vendedor', vendedorId) and order by created_at desc", async () => {
    const chain = makeChain({ data: [makeRow()], error: null });
    fromMock.mockReturnValue(chain);

    await transaccionesRepository.listarPorVendedor("v-1");

    expect(fromMock).toHaveBeenCalledWith("transacciones");
    expect(chain.eq).toHaveBeenCalledWith("id_vendedor", "v-1");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("(2) returns the mapped Transaccion[] on success (snake_case -> camelCase)", async () => {
    const chain = makeChain({ data: [makeRow()], error: null });
    fromMock.mockReturnValue(chain);

    const result = await transaccionesRepository.listarPorVendedor("v-1");

    expect(result).toHaveLength(1);
    const t: Transaccion = result[0]!;
    expect(t.id).toBe("t-1");
    expect(t.loteId).toBe("l-1");
    expect(t.compradorNombre).toBe("Juan Pérez");
    expect(t.compradorDocumento).toBe("12345678");
    expect(t.monto).toBe(50000);
    expect(t.moneda).toBe("PEN");
    expect(t.idVendedor).toBe("v-1");
    expect(t.createdAt).toBe("2026-01-15T10:00:00Z");
  });

  it("(3) returns an empty array when the repository yields no rows", async () => {
    const chain = makeChain({ data: null, error: null });
    fromMock.mockReturnValue(chain);

    const result = await transaccionesRepository.listarPorVendedor("v-empty");
    expect(result).toEqual([]);
  });

  it("(4) throws when the supabase call returns an error", async () => {
    const chain = makeChain({
      data: null,
      error: { message: "RLS blocked", code: "42501" },
    });
    fromMock.mockReturnValue(chain);

    await expect(transaccionesRepository.listarPorVendedor("v-1")).rejects.toThrow(
      /Error al listar transacciones del vendedor/,
    );
  });

  it("(5) does NOT call .eq('lote_id', ...) — only 'id_vendedor'", async () => {
    const chain = makeChain({ data: [], error: null }) as unknown as {
      eq: { mock: { calls: Array<[string, unknown]> } };
    };
    fromMock.mockReturnValue(chain);

    await transaccionesRepository.listarPorVendedor("v-1");

    const eqCalls = chain.eq.mock.calls;
    expect(eqCalls.map((c) => c[0])).toEqual(["id_vendedor"]);
  });
});
