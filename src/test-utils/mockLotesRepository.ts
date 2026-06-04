import type { Lote, EstadoLote } from "@/domain/entities/lote";

/**
 * Shared mock factory for `lotesRepository` used by T-1.2 (MapaLotes retro
 * tests) and T-1.4 (useLotes/useRealtimeLotes/useStatusMutation retro tests).
 * Keeps test data deterministic and avoids hitting Supabase from unit tests.
 */
export interface LoteFixtureOverrides {
  id?: string;
  codigo?: string;
  estado?: EstadoLote;
  precio?: number;
  moneda?: "PEN" | "USD";
  poligonoCoords?: number[][][];
}

export function makeLoteFixture(overrides: LoteFixtureOverrides = {}): Lote {
  return {
    id: overrides.id ?? "lote-fixture-1",
    proyectoId: "proy-1",
    codigo: overrides.codigo ?? "LT-001",
    areaTotal: 200,
    precio: overrides.precio ?? 100000,
    moneda: overrides.moneda ?? "PEN",
    estado: overrides.estado ?? "disponible",
    poligonoCoords: overrides.poligonoCoords ?? [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
    orden: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

export function makeLoteListFixture(count: number, baseOverrides: LoteFixtureOverrides = {}): Lote[] {
  return Array.from({ length: count }, (_, i) =>
    makeLoteFixture({ ...baseOverrides, id: `lote-${i + 1}`, codigo: `LT-${String(i + 1).padStart(3, "0")}` }),
  );
}

/**
 * Mock objeto for `lotesRepository`. Use with `vi.mock("@/data/repositories", ...)`.
 * Tests that need a different return value can override per-method.
 */
export const mockLotesRepository = {
  listar: vi.fn(),
  obtenerPorId: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  cambiarEstado: vi.fn(),
  eliminar: vi.fn(),
};

// Vitest needs a `vi` reference — import it lazily so the file can be imported
// from non-vitest contexts without exploding.
import { vi } from "vitest";
