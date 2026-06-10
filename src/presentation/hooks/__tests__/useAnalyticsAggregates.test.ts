import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useAnalyticsAggregates } from "@/presentation/hooks/useAnalyticsAggregates";

// ── Mock analyticsRepository ──────────────────────────────────────────
const getAggregatesMock = vi.fn();

vi.mock("@/data/repositories", () => ({
  analyticsRepository: {
    getAggregates: (...args: unknown[]) => getAggregatesMock(...args),
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeAggregateFixture() {
  return {
    total_visitors: 0,
    total_events: 42,
    parcel_aggregates: [
      {
        parcel_id: "parcel-1",
        parcel_code: "L-001",
        total_clicks: 25,
        whatsapp_clicks: 5,
        share_clicks: 3,
      },
      {
        parcel_id: "parcel-2",
        parcel_code: "L-002",
        total_clicks: 17,
        whatsapp_clicks: 2,
        share_clicks: 1,
      },
    ],
  };
}

beforeEach(() => {
  getAggregatesMock.mockReset();
});

describe("useAnalyticsAggregates", () => {
  it("calls analyticsRepository.getAggregates with tourId and dateRange", async () => {
    const fixture = makeAggregateFixture();
    getAggregatesMock.mockResolvedValue(fixture);

    const start = new Date("2026-01-01");
    const end = new Date("2026-01-31");

    const { result } = renderHook(
      () => useAnalyticsAggregates("tour-123", { start, end }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getAggregatesMock).toHaveBeenCalledWith("tour-123", { start, end });
  });

  it("returns summary with parcel_aggregates", async () => {
    const fixture = makeAggregateFixture();
    getAggregatesMock.mockResolvedValue(fixture);

    const { result } = renderHook(
      () => useAnalyticsAggregates("tour-123"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary.total_events).toBe(42);
    expect(result.current.topParcels).toHaveLength(2);
    expect(result.current.topParcels[0]?.parcel_code).toBe("L-001");
    expect(result.current.topParcels[0]?.total_clicks).toBe(25);
  });

  it("derives eventTypeBreakdown from aggregates", async () => {
    const fixture = makeAggregateFixture();
    getAggregatesMock.mockResolvedValue(fixture);

    const { result } = renderHook(
      () => useAnalyticsAggregates("tour-123"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.eventTypeBreakdown).toEqual([
      { type: "Parcel Clicks", count: 42 },
      { type: "WhatsApp", count: 7 },
      { type: "Share", count: 4 },
    ]);
  });

  it("returns empty state when no tourId", async () => {
    const { result } = renderHook(
      () => useAnalyticsAggregates(""),
      { wrapper: makeWrapper() },
    );

    await new Promise((r) => setTimeout(r, 50));

    expect(getAggregatesMock).not.toHaveBeenCalled();
    expect(result.current.topParcels).toHaveLength(0);
    expect(result.current.eventTypeBreakdown).toHaveLength(0);
  });

  it("returns empty aggregates when repository returns empty", async () => {
    getAggregatesMock.mockResolvedValue({
      total_visitors: 0,
      total_events: 0,
      parcel_aggregates: [],
    });

    const { result } = renderHook(
      () => useAnalyticsAggregates("tour-123"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.topParcels).toHaveLength(0);
    expect(result.current.eventTypeBreakdown).toEqual([]);
  });

  it("surfaces errors when repository fails", async () => {
    getAggregatesMock.mockRejectedValue(new Error("RPC failed"));

    const { result } = renderHook(
      () => useAnalyticsAggregates("tour-123"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
