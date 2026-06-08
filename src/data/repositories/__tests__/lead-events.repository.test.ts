import { describe, it, expect, vi, beforeEach } from "vitest";

// Build a chainable Supabase mock
function createChainMock(finalResult: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ["insert", "select", "eq", "order", "single"];
  for (const method of methods) {
    if (method === "single") {
      chain[method] = vi.fn().mockResolvedValue(finalResult);
    } else if (method === "order") {
      chain[method] = vi.fn().mockResolvedValue(finalResult);
    } else {
      chain[method] = vi.fn().mockReturnValue(chain);
    }
  }
  return chain;
}

let chainMock: ReturnType<typeof createChainMock>;

vi.mock("@/lib/supabase/client", () => ({
  get supabase() {
    return {
      from: vi.fn(() => chainMock),
    };
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: vi.fn(),
}));

// Import AFTER mocks
import { leadEventsRepository } from "@/data/repositories/lead-events.repository.impl";

describe("leadEventsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registrar", () => {
    it("inserts a lead event and returns mapped entity", async () => {
      const mockRow = {
        id: "evt-1",
        visitor_id: "visitor-123",
        property_id: "prop-456",
        event_type: "whatsapp_click",
        metadata: { propertyName: "Test" },
        created_at: "2026-01-01T00:00:00Z",
      };
      chainMock = createChainMock({ data: mockRow, error: null });

      const result = await leadEventsRepository.registrar({
        visitorId: "visitor-123",
        propertyId: "prop-456",
        eventType: "whatsapp_click",
        metadata: { propertyName: "Test" },
      });

      expect(result).toEqual({
        id: "evt-1",
        visitorId: "visitor-123",
        propertyId: "prop-456",
        eventType: "whatsapp_click",
        metadata: { propertyName: "Test" },
        createdAt: "2026-01-01T00:00:00Z",
      });
    });

    it("maps snake_case database columns to camelCase entity", async () => {
      const mockRow = {
        id: "evt-2",
        visitor_id: "v-1",
        property_id: "p-1",
        event_type: "view",
        metadata: {},
        created_at: "2026-06-07T12:00:00Z",
      };
      chainMock = createChainMock({ data: mockRow, error: null });

      const result = await leadEventsRepository.registrar({
        visitorId: "v-1",
        propertyId: "p-1",
        eventType: "view",
      });

      expect(result.visitorId).toBe("v-1");
      expect(result.propertyId).toBe("p-1");
      expect(result.eventType).toBe("view");
      expect(result.createdAt).toBe("2026-06-07T12:00:00Z");
    });
  });

  describe("listarPorVisitor", () => {
    it("returns mapped events for a given visitor", async () => {
      const mockRows = [
        {
          id: "evt-1",
          visitor_id: "visitor-1",
          property_id: "prop-1",
          event_type: "view",
          metadata: {},
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          id: "evt-2",
          visitor_id: "visitor-1",
          property_id: "prop-1",
          event_type: "whatsapp_click",
          metadata: {},
          created_at: "2026-01-01T00:01:00Z",
        },
      ];
      chainMock = createChainMock({ data: mockRows, error: null });

      const result = await leadEventsRepository.listarPorVisitor("visitor-1");

      expect(result).toHaveLength(2);
      expect(result[0]?.eventType).toBe("view");
      expect(result[1]?.eventType).toBe("whatsapp_click");
    });

    it("returns empty array when no events found", async () => {
      chainMock = createChainMock({ data: [], error: null });

      const result = await leadEventsRepository.listarPorVisitor("nonexistent");

      expect(result).toEqual([]);
    });
  });
});
