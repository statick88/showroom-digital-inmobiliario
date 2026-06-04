import { describe, it, expect, vi, beforeEach } from "vitest";

import { leadsRepository } from "@/data/repositories/leads.repository.impl";

/* eslint-disable @typescript-eslint/no-explicit-any */
const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

type LeadRow = Record<string, unknown>;

function makeRow(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: "lead-1",
    propiedad_id: "prop-1",
    perfil_id: "perfil-1",
    nombre: "Ada Lovelace",
    email: "ada@example.com",
    telefono: "+51 999 999 999",
    score: 85,
    estado: "nuevo",
    notas: "Quiere visitar el sábado",
    created_at: "2026-01-15T10:00:00.000Z",
    propiedades: {
      titulo: "Casa en Miraflores",
      codigo: "P-001",
      agencia_id: "ag-1",
    },
    ...overrides,
  };
}

/**
 * Build a thenable chain that resolves with the provided { data, error }
 * payload when awaited, with optional side-chains for eq/order/select/etc.
 */
function thenable(payload: { data: unknown; error: unknown }) {
  const obj: any = {};
  const resolve = () => Promise.resolve(payload);
  obj.then = (onFulfilled: any) => resolve().then(onFulfilled);
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === "then") return target.then;
      // Each terminal method returns a fresh thenable that resolves
      // to the same payload
      return (..._args: unknown[]) => thenable(payload);
    },
  });
}

beforeEach(() => {
  fromMock.mockReset();
});

describe("leadsRepository", () => {
  describe("listarPorAgencia", () => {
    it("(1) returns mapped leads with propiedades join data", async () => {
      fromMock.mockReturnValue(thenable({ data: [makeRow()], error: null }));

      const result = await leadsRepository.listarPorAgencia("ag-1");

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("lead-1");
      expect(result[0]?.propiedadTitulo).toBe("Casa en Miraflores");
      expect(result[0]?.propiedadCodigo).toBe("P-001");
    });

    it("(2) tolerates null data (returns empty array)", async () => {
      fromMock.mockReturnValue(thenable({ data: null, error: null }));

      const result = await leadsRepository.listarPorAgencia("ag-1");

      expect(result).toEqual([]);
    });

    it("(3) throws when supabase returns an error", async () => {
      fromMock.mockReturnValue(thenable({ data: null, error: { message: "boom" } }));

      await expect(leadsRepository.listarPorAgencia("ag-1")).rejects.toThrow(
        "Error al cargar leads",
      );
    });

    it("(4) maps rows whose propiedades join is undefined (propiedadTitulo/Codigo are undefined)", async () => {
      const row = makeRow();
      delete row.propiedades;
      fromMock.mockReturnValue(thenable({ data: [row], error: null }));

      const result = await leadsRepository.listarPorAgencia("ag-1");

      expect(result[0]?.propiedadTitulo).toBeUndefined();
      expect(result[0]?.propiedadCodigo).toBeUndefined();
    });
  });

  describe("crear", () => {
    it("(5) inserts a lead and returns the mapped row", async () => {
      fromMock.mockReturnValue(thenable({ data: makeRow({ id: "new-lead" }), error: null }));

      const result = await leadsRepository.crear({
        propiedadId: "prop-1",
        nombre: "Grace",
        email: "grace@example.com",
        consent_timestamp: "2026-01-15T10:00:00.000Z",
        consent_ip: "127.0.0.1",
        user_agent: "vitest/1.0",
      });

      expect(result.id).toBe("new-lead");
    });

    it("(6) throws when supabase insert fails", async () => {
      fromMock.mockReturnValue(thenable({ data: null, error: { message: "Insert failed" } }));

      await expect(
        leadsRepository.crear({
          propiedadId: "prop-1",
          nombre: "Grace",
          email: "grace@example.com",
          consent_timestamp: "2026-01-15T10:00:00.000Z",
          consent_ip: "127.0.0.1",
          user_agent: "vitest/1.0",
        }),
      ).rejects.toThrow("Error al enviar solicitud");
    });
  });

  describe("actualizarScore", () => {
    it("(7) updates a lead's score and returns the mapped row", async () => {
      fromMock.mockReturnValue(thenable({ data: makeRow({ score: 95 }), error: null }));

      const result = await leadsRepository.actualizarScore("lead-1", 95);

      expect(result.score).toBe(95);
    });

    it("(8) throws when supabase update fails", async () => {
      fromMock.mockReturnValue(thenable({ data: null, error: { message: "Update failed" } }));

      await expect(leadsRepository.actualizarScore("lead-1", 50)).rejects.toThrow(
        "Error al actualizar lead",
      );
    });
  });
});
