import { describe, it, expect, vi, beforeEach } from "vitest";

import { lotesRepository } from "@/data/repositories/supabase-lotes.repository.impl";

// ── Supabase chain mock — every fluent method returns the same builder,
//    so .from().select().eq().order().or() all work regardless of order. ──
const fromMock = vi.fn();
const singleMock = vi.fn();
const builderMethods: Record<string, ReturnType<typeof vi.fn>> = {};
const chain: Record<string, ReturnType<typeof vi.fn>> = {};

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "lote-row-1",
    proyecto_id: "proy-1",
    codigo: "LT-001",
    area_total: 200,
    frente: 10,
    fondo: 20,
    precio: 100000,
    moneda: "PEN",
    estado: "disponible",
    poligono_coords: [[[0, 0]]],
    imagen_plano: null,
    descripcion: null,
    orden: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: (error: unknown) => {
    if (error) throw new Error((error as { message: string }).message ?? "supabase error");
  },
}));

beforeEach(() => {
  fromMock.mockReset();
  singleMock.mockReset();
  // Wipe and rebuild the chain
  for (const k of Object.keys(builderMethods)) delete builderMethods[k];
  for (const k of Object.keys(chain)) delete chain[k];
  for (const name of ["select", "insert", "update", "delete", "eq", "order", "or"]) {
    builderMethods[name] = vi.fn(() => chain);
    chain[name] = builderMethods[name];
  }
  chain.single = singleMock;
  // .from(table) returns chain
  fromMock.mockReturnValue(chain);
});

describe("supabase-lotes.repository.impl — listar (with filters / mapping / errors)", () => {
  it("(1) listar: queries 'lotes' table with .select('*').eq('proyecto_id', id).order('orden')", async () => {
    singleMock.mockResolvedValue({ data: null, error: null });
    // The terminal await hits chain (since order returns chain, the resolved value comes from the LAST method that the await is on)
    // In supabase-js, the builder is also thenable — for our test we just need the await to resolve.
    // The implementation awaits `query` directly, so we need the chain itself to be thenable.
    // Quick fix: give the chain a `then` that resolves with our data.
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: [makeRow()], error: null }),
    });

    const result = await lotesRepository.listar("proy-1");

    expect(fromMock).toHaveBeenCalledWith("lotes");
    expect(builderMethods.select).toHaveBeenCalledWith("*");
    expect(builderMethods.eq).toHaveBeenCalledWith("proyecto_id", "proy-1");
    expect(builderMethods.order).toHaveBeenCalledWith("orden", { ascending: true });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("lote-row-1");
    expect(result[0]?.proyectoId).toBe("proy-1");
  });

  it("(2) listar: maps snake_case DB rows to camelCase Lote entity (Number() coercion on numerics)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) =>
        resolve({ data: [makeRow({ area_total: "300.5", precio: "150000" })], error: null }),
    });

    const result = await lotesRepository.listar("proy-1");
    expect(result[0]?.areaTotal).toBe(300.5);
    expect(result[0]?.precio).toBe(150000);
  });

  it("(3) listar: applies filtros.estado as a second .eq('estado', filtros.estado)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
    });

    await lotesRepository.listar("proy-1", { estado: "disponible" });

    expect(builderMethods.eq).toHaveBeenCalledWith("proyecto_id", "proy-1");
    expect(builderMethods.eq).toHaveBeenCalledWith("estado", "disponible");
  });

  it("(4) listar: applies filtros.search as .or() with ilike on codigo + descripcion", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
    });

    await lotesRepository.listar("proy-1", { search: "LT" });

    expect(builderMethods.or).toHaveBeenCalledWith("codigo.ilike.%LT%,descripcion.ilike.%LT%");
  });

  it("(5) listar: strips SQL wildcard chars from filtros.search before building the ilike", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
    });

    await lotesRepository.listar("proy-1", { search: "%_\\evil" });

    const orCall = builderMethods.or!.mock.calls[0]?.[0] as string;
    // % and _ and \ are stripped, leaving "evil"
    expect(orCall).toBe("codigo.ilike.%evil%,descripcion.ilike.%evil%");
  });

  it("(6) listar: returns [] when data is null (no lotes for that filter)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
    });

    const result = await lotesRepository.listar("proy-1");
    expect(result).toEqual([]);
  });

  it("(7) listar: throws when supabase returns an error (via rethrowIfPresent)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) =>
        resolve({ data: null, error: { message: "PostgrestError" } }),
    });

    await expect(lotesRepository.listar("proy-1")).rejects.toThrow("PostgrestError");
  });
});

describe("supabase-lotes.repository.impl — obtenerPorId (single row)", () => {
  it("(8) obtenerPorId: returns mapped Lote on success", async () => {
    singleMock.mockResolvedValue({ data: makeRow({ codigo: "LT-007" }), error: null });

    const result = await lotesRepository.obtenerPorId("lote-row-1");
    expect(result?.id).toBe("lote-row-1");
    expect(result?.codigo).toBe("LT-007");
  });

  it("(9) obtenerPorId: returns null when supabase returns an error (graceful — useLote relies on this)", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "PGRST116" } });

    const result = await lotesRepository.obtenerPorId("missing");
    expect(result).toBeNull();
  });
});

describe("supabase-lotes.repository.impl — crear / actualizar / cambiarEstado / eliminar", () => {
  it("(10) crear: inserts a snake_case row and returns the mapped Lote (default estado: 'disponible')", async () => {
    singleMock.mockResolvedValue({ data: makeRow({ codigo: "LT-NEW" }), error: null });

    const created = await lotesRepository.crear({
      proyectoId: "proy-1",
      codigo: "LT-NEW",
      areaTotal: 200,
      precio: 100000,
      moneda: "PEN",
      poligonoCoords: [[[0, 0]]],
    });

    expect(builderMethods.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        proyecto_id: "proy-1",
        codigo: "LT-NEW",
        area_total: 200,
        precio: 100000,
        moneda: "PEN",
        estado: "disponible",
        poligono_coords: [[[0, 0]]],
      }),
    );
    expect(created.codigo).toBe("LT-NEW");
  });

  it("(11) crear: respects caller-provided estado, frente, fondo, descripcion, imagenPlano, orden", async () => {
    singleMock.mockResolvedValue({ data: makeRow(), error: null });

    await lotesRepository.crear({
      proyectoId: "proy-1",
      codigo: "LT-002",
      areaTotal: 200,
      frente: 10,
      fondo: 20,
      precio: 100000,
      moneda: "USD",
      estado: "vendido",
      poligonoCoords: [[[0, 0]]],
      imagenPlano: "https://img/plano.png",
      descripcion: "lote esquinero",
      orden: 5,
    });

    expect(builderMethods.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: "vendido",
        frente: 10,
        fondo: 20,
        imagen_plano: "https://img/plano.png",
        descripcion: "lote esquinero",
        orden: 5,
      }),
    );
  });

  it("(12) actualizar: only forwards fields that are not undefined (PATCH semantics)", async () => {
    singleMock.mockResolvedValue({ data: makeRow(), error: null });

    await lotesRepository.actualizar("lote-1", { precio: 999, estado: "vendido" });

    expect(builderMethods.update).toHaveBeenCalledWith({ precio: 999, estado: "vendido" });
    const updateArg = builderMethods.update!.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(updateArg).not.toHaveProperty("codigo");
    expect(updateArg).not.toHaveProperty("area_total");
  });

  it("(13) actualizar: maps camelCase Partial<Lote> to snake_case DB columns", async () => {
    singleMock.mockResolvedValue({ data: makeRow(), error: null });

    await lotesRepository.actualizar("lote-1", {
      areaTotal: 250,
      frente: 11,
      fondo: 21,
      moneda: "USD",
      poligonoCoords: [[[1, 1]]],
      imagenPlano: "img.png",
      descripcion: "updated",
      orden: 2,
      codigo: "LT-NEW-CODE",
    });

    expect(builderMethods.update).toHaveBeenCalledWith({
      area_total: 250,
      frente: 11,
      fondo: 21,
      moneda: "USD",
      poligono_coords: [[[1, 1]]],
      imagen_plano: "img.png",
      descripcion: "updated",
      orden: 2,
      codigo: "LT-NEW-CODE",
    });
  });

  it("(14) cambiarEstado: updates only the 'estado' column and returns the mapped lote", async () => {
    singleMock.mockResolvedValue({
      data: makeRow({ estado: "vendido" }),
      error: null,
    });

    const result = await lotesRepository.cambiarEstado("lote-1", "vendido");

    expect(builderMethods.update).toHaveBeenCalledWith({ estado: "vendido" });
    expect(builderMethods.eq).toHaveBeenCalledWith("id", "lote-1");
    expect(result.estado).toBe("vendido");
  });

  it("(15) eliminar: issues delete().eq('id', id) and resolves on success", async () => {
    // The implementation awaits `supabase.from('lotes').delete().eq('id', id)` directly.
    // Provide a thenable chain that resolves.
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
    });

    await expect(lotesRepository.eliminar("lote-1")).resolves.toBeUndefined();
    expect(builderMethods.delete).toHaveBeenCalled();
    expect(builderMethods.eq).toHaveBeenCalledWith("id", "lote-1");
  });

  it("(16) eliminar: throws when supabase returns an error", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) =>
        resolve({ data: null, error: { message: "FK violation" } }),
    });

    await expect(lotesRepository.eliminar("lote-1")).rejects.toThrow("FK violation");
  });
});
