import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useRealtimeLotes } from "@/presentation/hooks/useRealtimeLotes";

// ── Hoisted mock state ────────────────────────────────────────────
const { channelInstance, channelMock, onHandlerRef } = vi.hoisted(() => {
  const onHandlerRef: { current: ((payload: unknown) => void) | null } = { current: null };
  const inst = {
    on: vi.fn((_event: string, _config: unknown, handler: (payload: unknown) => void) => {
      onHandlerRef.current = handler;
      return inst;
    }),
    subscribe: vi.fn((cb?: (status: string) => void) => {
      cb?.("SUBSCRIBED");
      return inst;
    }),
    unsubscribe: vi.fn(),
  };
  return {
    channelInstance: inst,
    channelMock: vi.fn(() => inst),
    onHandlerRef,
  };
});

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    channel: channelMock,
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  channelInstance.on.mockClear();
  channelInstance.subscribe.mockClear();
  channelInstance.unsubscribe.mockClear();
  channelMock.mockClear();
  onHandlerRef.current = null;
  // Re-attach chain semantics
  channelInstance.on.mockImplementation(
    (_event: string, _config: unknown, handler: (payload: unknown) => void) => {
      onHandlerRef.current = handler;
      return channelInstance;
    },
  );
  channelInstance.subscribe.mockImplementation((cb?: (status: string) => void) => {
    cb?.("SUBSCRIBED");
    return channelInstance;
  });
});

describe("useRealtimeLotes — retro tests (T-1.4, PR-1 foundations baseline)", () => {
  it("(1) subscribes to the 'lotes' table on mount via supabase.channel", async () => {
    renderHook(() => useRealtimeLotes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(channelMock).toHaveBeenCalledWith("lotes-realtime"));
    expect(channelInstance.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ event: "*", table: "lotes" }),
      expect.any(Function),
    );
  });

  it("(2) sets isSubscribed=true when the SUBSCRIBED status arrives", async () => {
    const { result } = renderHook(() => useRealtimeLotes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSubscribed).toBe(true));
    expect(result.current.error).toBeNull();
  });

  it("(3) unsubscribes on unmount (no leak)", async () => {
    const { unmount } = renderHook(() => useRealtimeLotes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(channelMock).toHaveBeenCalled());
    unmount();
    expect(channelInstance.unsubscribe).toHaveBeenCalled();
  });

  it("(4) on postgres_changes payload, invalidates the ['lotes'] query key", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    renderHook(() => useRealtimeLotes(), { wrapper: Wrapper });

    await waitFor(() => expect(onHandlerRef.current).toBeTypeOf("function"));

    act(() => {
      // Simulate a Supabase INSERT/UPDATE/DELETE on the 'lotes' table
      onHandlerRef.current?.({
        eventType: "INSERT",
        new: { id: "lote-new" },
        old: {},
        schema: "public",
        table: "lotes",
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["lotes"] });
  });
});
