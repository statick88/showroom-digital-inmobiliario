import { describe, it, expect, vi, beforeEach } from "vitest";
import { leadScoresRepository } from "@/data/repositories/lead-scores.repository.impl";

// Mock Supabase client — use vi.hoisted so variables are available in vi.mock factory
const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: vi.fn((error: unknown, msg: string) => {
    if (error) throw new Error(msg);
  }),
}));

describe("leadScoresRepository (PR-3) — Supabase implementation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("compute", () => {
    it("calls RPC compute_lead_score and upserts lead_scores", async () => {
      mockRpc.mockResolvedValue({ data: 75, error: null });
      mockFrom.mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: "score-1",
                visitor_id: "visitor-abc",
                score: 75,
                breakdown: { views: 3, clicks: 2, time: 60, repeats: 1 },
                computed_at: "2026-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await leadScoresRepository.compute("visitor-abc");

      expect(mockRpc).toHaveBeenCalledWith("compute_lead_score", {
        p_visitor_id: "visitor-abc",
      });
      expect(result.score).toBe(75);
      expect(result.visitorId).toBe("visitor-abc");
    });

    it("throws on RPC error", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "RPC failed" } });

      await expect(leadScoresRepository.compute("visitor-err")).rejects.toThrow(
        "Error al computing lead score",
      );
    });
  });

  describe("getByVisitor", () => {
    it("returns LeadScore when found", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "score-2",
          visitor_id: "visitor-xyz",
          score: 42,
          breakdown: { views: 2, clicks: 1, time: 30, repeats: 0 },
          computed_at: "2026-01-01T00:00:00Z",
        },
        error: null,
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await leadScoresRepository.getByVisitor("visitor-xyz");

      expect(result).not.toBeNull();
      expect(result!.score).toBe(42);
      expect(result!.visitorId).toBe("visitor-xyz");
    });

    it("returns null when no score found", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await leadScoresRepository.getByVisitor("visitor-none");

      expect(result).toBeNull();
    });
  });

  describe("listTopScores", () => {
    it("returns top scores ordered by score descending", async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [
          {
            id: "s1",
            visitor_id: "v1",
            score: 90,
            breakdown: { views: 5, clicks: 3, time: 120, repeats: 2 },
            computed_at: "2026-01-01T00:00:00Z",
          },
          {
            id: "s2",
            visitor_id: "v2",
            score: 65,
            breakdown: { views: 3, clicks: 1, time: 45, repeats: 1 },
            computed_at: "2026-01-01T00:00:00Z",
          },
        ],
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      });

      const result = await leadScoresRepository.listTopScores(10);

      expect(mockOrder).toHaveBeenCalledWith("score", { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
      expect(result[0]!.score).toBe(90);
      expect(result[1]!.score).toBe(65);
    });

    it("defaults to limit 50 when no limit provided", async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      });

      await leadScoresRepository.listTopScores();

      expect(mockOrder).toHaveBeenCalledWith("score", { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });
});
