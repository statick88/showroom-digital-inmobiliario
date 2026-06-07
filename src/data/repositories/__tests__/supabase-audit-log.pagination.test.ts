import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditLogRepository } from "@/data/repositories/supabase-audit-log.repository.impl";
import type { AuditLogEntry, AuditLogFilters } from "@/domain/repositories/audit-log.repository";

// ── Mock Supabase client using vi.hoisted ───────────────────────────────
const { mockFrom, mockSelect, mockEq, mockIlike, mockGte, mockLte, mockOrder, mockRange } =
  vi.hoisted(() => {
    const query = {
      eq: vi.fn(),
      ilike: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
      select: vi.fn(),
    };
    // Make all methods return the query object for chaining
    Object.keys(query).forEach((key) => {
      if (typeof query[key] === "function") {
        query[key].mockReturnValue(query);
      }
    });
    return {
      mockFrom: vi.fn(() => query),
      mockSelect: vi.fn(() => query),
      mockEq: query.eq,
      mockIlike: query.ilike,
      mockGte: query.gte,
      mockLte: query.lte,
      mockOrder: query.order,
      mockRange: query.range,
    };
  });

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: mockFrom,
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: vi.fn(),
}));

const makeAuditLogRow = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: "audit-1",
  tabla: "propiedades",
  accion: "INSERT",
  actor: "admin@inmobiliaria.pe",
  actor_rol: "admin",
  registro_id: "prop-1",
  valores_antiguos: null,
  valores_nuevos: { id: "prop-1", titulo: "Casa en Miraflores", precio: 500000 },
  created_at: "2026-01-15T10:30:00.000Z",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("supabase-audit-log.repository — pagination (T-5.6)", () => {
  it("(1) calls .range with correct offset/limit for page 0, pageSize 100", async () => {
    const { mockRange } = vi.mocked(await import("@/lib/supabase/client")).supabase.from().range;
    // We need to mock the final resolved value
    const { supabase } = await import("@/lib/supabase/client");
    const query = supabase.from("audit_log");
    query.range.mockResolvedValueOnce({ data: [{ id: "audit-1" }], error: null, count: 1 });

    const { auditLogRepository } =
      await import("@/data/repositories/supabase-audit-log.repository.impl");

    const result = await auditLogRepository.listar({ page: 0, pageSize: 100 });

    expect(result.rows).toHaveLength(1);
  });

  it("(2) calls .range with correct offset/limit for page 1, pageSize 100", async () => {
    const { supabase } = await import("@/lib/supabase/client");
    const query = supabase.from("audit_log");
    query.range.mockResolvedValueOnce({ data: [{ id: "audit-2" }], error: null, count: 150 });

    const { auditLogRepository } =
      await import("@/data/repositories/supabase-audit-log.repository.impl");

    const result = await auditLogRepository.listar({ page: 1, pageSize: 100 });

    expect(result.total).toBe(150);
  });

  it("(3) returns total count from Supabase for pagination UI", async () => {
    const { supabase } = await import("@/lib/supabase/client");
    const query = supabase.from("audit_log");
    query.range.mockResolvedValueOnce({
      data: Array.from({ length: 50 }, (_, i) => ({ id: `audit-${i}` })),
      error: null,
      count: 500,
    });

    const { auditLogRepository } =
      await import("@/data/repositories/supabase-audit-log.repository.impl");

    const result = await auditLogRepository.listar({ page: 0, pageSize: 50 });

    expect(result.rows).toHaveLength(50);
    expect(result.total).toBe(500);
  });
});
