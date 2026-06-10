import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockInsertEvents = vi.fn().mockResolvedValue(undefined);

vi.mock("@/data/repositories", () => ({
  analyticsRepository: {
    insertEvents: (...args: unknown[]) => mockInsertEvents(...args),
  },
}));

import { useTourAnalytics } from "../useTourAnalytics";

// ── Memory Storage (same pattern as useWhatsAppTour.test.tsx) ──────
function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

describe("useTourAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Provide localStorage via Object.defineProperty (jsdom doesn't expose it by default)
    const memoryStorage = createMemoryStorage();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => memoryStorage,
    });
    // Stub crypto.randomUUID
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-0000-0000-000000000001" as `${string}-${string}-${string}-${string}-${string}`,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("buffer threshold flush (task 2.3)", () => {
    it("does NOT insert when buffer has 49 events", () => {
      const { result } = renderHook(() => useTourAnalytics("tour-1"));

      act(() => {
        for (let i = 0; i < 49; i++) {
          result.current.track("parcel_click", {}, `parcel-${i}`);
        }
      });

      expect(mockInsertEvents).not.toHaveBeenCalled();
    });

    it("inserts ALL 50 events when threshold is reached", () => {
      const { result } = renderHook(() => useTourAnalytics("tour-1"));

      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.track("parcel_click", {}, `parcel-${i}`);
        }
      });

      expect(mockInsertEvents).toHaveBeenCalledTimes(1);
      expect(mockInsertEvents).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            event_type: "parcel_click",
            tour_id: "tour-1",
            parcel_id: expect.stringMatching(/^parcel-\d+$/),
          }),
        ]),
      );
      // Verify exactly 50 events were passed
      const firstCall = mockInsertEvents.mock.calls[0];
      expect(firstCall?.[0]).toHaveLength(50);
    });
  });

  describe("flush on unmount (task 2.4)", () => {
    it("calls flush on unmount with pending events", () => {
      const { result, unmount } = renderHook(() =>
        useTourAnalytics("tour-1"),
      );

      act(() => {
        result.current.track("parcel_click");
        result.current.track("tour_start");
      });

      unmount();

      expect(mockInsertEvents).toHaveBeenCalled();
      const flushedEvents = mockInsertEvents.mock.calls[0]?.[0];
      expect(flushedEvents).toHaveLength(2);
    });

    it("does NOT call insert when unmounting with empty buffer", () => {
      const { unmount } = renderHook(() => useTourAnalytics("tour-1"));

      unmount();

      // The cleanup calls flush(), which checks length === 0 and returns early
      expect(mockInsertEvents).not.toHaveBeenCalled();
    });
  });

  describe("periodic flush", () => {
    it("flushes after 5s interval", () => {
      const { result } = renderHook(() => useTourAnalytics("tour-1"));

      act(() => {
        result.current.track("parcel_click");
      });

      act(() => {
        vi.advanceTimersByTime(5_000);
      });

      expect(mockInsertEvents).toHaveBeenCalledTimes(1);
    });
  });

  describe("visitor ID", () => {
    it("returns a persistent visitor ID from localStorage", () => {
      const { result } = renderHook(() => useTourAnalytics("tour-1"));
      expect(result.current.visitorId).toBe(
        "00000000-0000-0000-0000-000000000001",
      );
    });
  });

  describe("event shape", () => {
    it("track populates event with correct fields", () => {
      const { result } = renderHook(() => useTourAnalytics("tour-1"));

      act(() => {
        result.current.track("whatsapp_click", { phone: "+51999" }, "p-1");
      });

      act(() => {
        vi.advanceTimersByTime(5_000);
      });

      const events = mockInsertEvents.mock.calls[0]?.[0];
      expect(events?.[0]).toMatchObject({
        event_type: "whatsapp_click",
        tour_id: "tour-1",
        parcel_id: "p-1",
        visitor_id: "00000000-0000-0000-0000-000000000001",
        metadata: { phone: "+51999" },
      });
      expect(events?.[0]?.id).toBeDefined();
      expect(events?.[0]?.created_at).toBeDefined();
    });
  });
});
