import { describe, it, expect, vi } from "vitest";

import {
  makeLoteFixture,
  makeLoteListFixture,
  mockLotesRepository,
} from "@/test-utils/mockLotesRepository";

describe("mockLotesRepository — fixtures", () => {
  it("(1) makeLoteFixture returns defaults when called with no overrides (?? fallback branches)", () => {
    const lote = makeLoteFixture();
    expect(lote.id).toBe("lote-fixture-1");
    expect(lote.codigo).toBe("LT-001");
    expect(lote.estado).toBe("disponible");
    expect(lote.precio).toBe(100000);
    expect(lote.moneda).toBe("PEN");
    expect(lote.poligonoCoords).toEqual([
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ]);
  });

  it("(2) makeLoteFixture applies overrides on top of defaults", () => {
    const lote = makeLoteFixture({ id: "x", estado: "vendido" });
    expect(lote.id).toBe("x");
    expect(lote.estado).toBe("vendido");
    // Defaults still apply for fields not overridden
    expect(lote.codigo).toBe("LT-001");
  });

  it("(3) makeLoteListFixture produces N lotes with stable id and codigo sequences", () => {
    const list = makeLoteListFixture(3);
    expect(list).toHaveLength(3);
    expect(list[0]?.id).toBe("lote-1");
    expect(list[0]?.codigo).toBe("LT-001");
    expect(list[2]?.id).toBe("lote-3");
    expect(list[2]?.codigo).toBe("LT-003");
  });

  it("(4) makeLoteListFixture forwards baseOverrides to each entry", () => {
    const list = makeLoteListFixture(2, { estado: "vendido" });
    expect(list.every((l) => l.estado === "vendido")).toBe(true);
    // Ids are still sequenced even with baseOverrides
    expect(list[0]?.id).toBe("lote-1");
    expect(list[1]?.id).toBe("lote-2");
  });
});

describe("mockLotesRepository — mock object", () => {
  it("(5) exposes all six repository methods as vi.fn() instances", () => {
    expect(vi.isMockFunction(mockLotesRepository.listar)).toBe(true);
    expect(vi.isMockFunction(mockLotesRepository.obtenerPorId)).toBe(true);
    expect(vi.isMockFunction(mockLotesRepository.crear)).toBe(true);
    expect(vi.isMockFunction(mockLotesRepository.actualizar)).toBe(true);
    expect(vi.isMockFunction(mockLotesRepository.cambiarEstado)).toBe(true);
    expect(vi.isMockFunction(mockLotesRepository.eliminar)).toBe(true);
  });
});
