import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useRealtimeLotes } from "@/presentation/hooks/useRealtimeLotes";

// ── Mock supabase client with a controllable channel ─────────────
// Real supabase chain: `channel()` → `.on()` → `.subscribe()` →
// `.unsubscribe()`. All return the same channel object so it can chain.
const channelInstance = {
  on: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};
// Make `.on()` return the same instance for chaining
channelInstance.on.mockImplementation(() => channelInstance);
// `.subscribe(cb)` returns the same instance too
channelInstance.subscribe.mockImplementation((cb: (status: string) => void) => {
  cb("SUBSCRIBED");
  return channelInstance;
});
const channelMock = vi.fn(() => channelInstance);

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
  // Re-attach the chain semantics (clear() above doesn't reset implementations)
  channelInstance.on.mockImplementation(() => channelInstance);
  channelInstance.subscribe.mockImplementation((cb: (status: string) => void) => {
    cb("SUBSCRIBED");
    return channelInstance;
  });
});

describe("useRealtimeLotes — retro tests (T-1.4, PR-1 foundations baseline)", () => {
  it("(1) subscribes to the 'lotes' table on mount via supabase.channel", async () => {
    renderHook(() => useRealtimeLotes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(channelMock).toHaveBeenCalledWith("lotes-realtime"));
    // The .on() call must target the 'lotes' table with event='*'
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
});
