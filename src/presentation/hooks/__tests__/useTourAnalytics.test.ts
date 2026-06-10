import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useTourAnalytics } from "@/presentation/hooks/useTourAnalytics";

// ── Mock analyticsRepository ──────────────────────────────────────────
const insertEventsMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/data/repositories", () => ({
  analyticsRepository: {
    insertEvents: (...args: unknown[]) => insertEventsMock(...args),
  },
}));

// ── Mock localStorage ─────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  insertEventsMock.mockReset();
  insertEventsMock.mockResolvedValue(undefined);
  vi.useFakeTimers();
  Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });
  localStorageMock.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTourAnalytics", () => {
  it("returns a track function and visitorId", () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    expect(typeof result.current.track).toBe("function");
    expect(typeof result.current.flush).toBe("function");
    expect(result.current.visitorId).toBeTruthy();
  });

  it("does not insert events before buffer is full or flush is called", () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      result.current.track("parcel_click", {}, "parcel-1");
      result.current.track("parcel_click", {}, "parcel-2");
      result.current.track("parcel_click", {}, "parcel-3");
    });

    expect(insertEventsMock).not.toHaveBeenCalled();
  });

  it("flushes events when buffer reaches 50", () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      for (let i = 0; i < 50; i++) {
        result.current.track("parcel_click", {}, `parcel-${i}`);
      }
    });

    expect(insertEventsMock).toHaveBeenCalledTimes(1);
    expect(insertEventsMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: "parcel_click",
          tour_id: "tour-1",
        }),
      ]),
    );
  });

  it("flushes events when flush() is called manually", async () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      result.current.track("tour_start");
      result.current.track("whatsapp_click", {}, "parcel-1");
    });

    await act(async () => {
      await result.current.flush();
    });

    expect(insertEventsMock).toHaveBeenCalledTimes(1);
    expect(insertEventsMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ event_type: "tour_start" }),
        expect.objectContaining({ event_type: "whatsapp_click" }),
      ]),
    );
  });

  it("does not call insert when buffer is empty on flush", async () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    await act(async () => {
      await result.current.flush();
    });

    expect(insertEventsMock).not.toHaveBeenCalled();
  });

  it("sends periodic flush every 5 seconds", () => {
    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      result.current.track("parcel_click", {}, "parcel-1");
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(insertEventsMock).toHaveBeenCalledTimes(1);
  });

  it("flushes remaining events on unmount", () => {
    const { result, unmount } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      result.current.track("parcel_click", {}, "parcel-1");
    });

    unmount();

    // The cleanup effect calls flush synchronously
    expect(insertEventsMock).toHaveBeenCalled();
  });

  it("silently drops errors from insertEvents", async () => {
    insertEventsMock.mockRejectedValueOnce(new Error("DB down"));

    const { result } = renderHook(() => useTourAnalytics("tour-1"));

    act(() => {
      result.current.track("parcel_click");
    });

    await act(async () => {
      await result.current.flush();
    });

    // Should not throw
    expect(insertEventsMock).toHaveBeenCalled();
  });
});
