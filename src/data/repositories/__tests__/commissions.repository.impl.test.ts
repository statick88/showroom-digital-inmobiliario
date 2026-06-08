import { describe, it, expect, vi, beforeEach } from "vitest";
import { commissionsRepository } from "@/data/repositories/commissions.repository.impl";

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: mockFrom,
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: vi.fn((error: unknown, msg: string) => {
    if (error) throw new Error(msg);
  }),
}));

describe("commissionsRepository (PR-4) — Supabase implementation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listarPorVendedor", () => {
    it("returns commissions filtered by vendedor_id", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: "c1",
            vendedor_id: "v1",
            property_id: "p1",
            sale_price: 400000,
            commission_amount: 8000,
            rule_applied: "Mid tier",
            status: "pending",
            sunat_invoice_id: null,
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      });

      const result = await commissionsRepository.listarPorVendedor("v1");

      expect(mockFrom).toHaveBeenCalledWith("vendedor_commissions");
      expect(result).toHaveLength(1);
      expect(result[0]!.vendedorId).toBe("v1");
      expect(result[0]!.salePrice).toBe(400000);
      expect(result[0]!.commissionAmount).toBe(8000);
    });

    it("returns empty array when no commissions found", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      });

      const result = await commissionsRepository.listarPorVendedor("v-none");

      expect(result).toEqual([]);
    });
  });

  describe("crear", () => {
    it("inserts a new commission and returns it", async () => {
      // First call: fetch commission_rules
      const mockRulesOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: "r1",
            min_price: 0,
            max_price: 500000,
            percentage: 2.0,
            description: "Mid tier",
            active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      });
      const mockRulesEq = vi.fn().mockReturnValue({ order: mockRulesOrder });
      const mockRulesSelect = vi.fn().mockReturnValue({ eq: mockRulesEq });

      // Second call: insert into vendedor_commissions
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "c-new",
          vendedor_id: "v1",
          property_id: "p2",
          sale_price: 600000,
          commission_amount: 15000,
          rule_applied: "Mid tier",
          status: "pending",
          sunat_invoice_id: null,
          created_at: "2026-01-01T00:00:00Z",
        },
        error: null,
      });
      const mockSelectSingle = vi.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelectSingle });

      mockFrom
        .mockReturnValueOnce({ select: mockRulesSelect })
        .mockReturnValueOnce({ insert: mockInsert });

      const result = await commissionsRepository.crear({
        vendedorId: "v1",
        propertyId: "p2",
        salePrice: 600000,
      });

      expect(result.id).toBe("c-new");
      expect(result.salePrice).toBe(600000);
      expect(result.status).toBe("pending");
    });
  });

  describe("cambiarEstado", () => {
    it("updates commission status and returns updated record", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "c1",
          vendedor_id: "v1",
          property_id: "p1",
          sale_price: 400000,
          commission_amount: 8000,
          rule_applied: "Mid tier",
          status: "approved",
          sunat_invoice_id: null,
          created_at: "2026-01-01T00:00:00Z",
        },
        error: null,
      });

      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      });

      const result = await commissionsRepository.cambiarEstado("c1", "approved");

      expect(result.status).toBe("approved");
      expect(result.id).toBe("c1");
    });
  });

  describe("listarReglas", () => {
    it("returns active commission rules", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: "r1",
            min_price: 0,
            max_price: 200000,
            percentage: 1.5,
            description: "Base",
            active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({ eq: mockEq }),
      });

      const result = await commissionsRepository.listarReglas();

      expect(result).toHaveLength(1);
      expect(result[0]!.minPrice).toBe(0);
      expect(result[0]!.percentage).toBe(1.5);
    });
  });
});
