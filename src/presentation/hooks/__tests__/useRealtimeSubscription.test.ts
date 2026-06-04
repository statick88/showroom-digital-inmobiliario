import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { render, act } from "@testing-library/react";

import { useRealtimeSubscription } from "@/presentation/hooks/useRealtimeSubscription";

// ── Hoisted mock state — useRealtimeSubscription is a generic hook
//    that needs to control the .subscribe((status) => { ... }) callback
//    to exercise the CHANNEL_ERROR, TIMED_OUT, CLOSED, SUBSCRIBED branches. ──
const { channelInstance, channelMock, subscribeCallbackRef } = vi.hoisted(() => {
  const subscribeCallbackRef: { current: ((status: string) => void) | null } = { current: null };
  const inst = {
    on: vi.fn(),
    subscribe: vi.fn((cb?: (status: string) => void) => {
      subscribeCallbackRef.current = cb ?? null;
      return inst;
    }),
    unsubscribe: vi.fn(),
  };
  return {
    channelInstance: inst,
    channelMock: vi.fn(() => inst),
    subscribeCallbackRef,
  };
});

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    channel: channelMock,
  },
}));

beforeEach(() => {
  channelInstance.on.mockClear();
  channelInstance.subscribe.mockClear();
  channelInstance.unsubscribe.mockClear();
  channelMock.mockClear();
  subscribeCallbackRef.current = null;
  // Re-attach chain semantics
  channelInstance.on.mockImplementation(() => channelInstance);
  // subscribe() re-captures the callback every time
  channelInstance.subscribe.mockImplementation((cb?: (status: string) => void) => {
    subscribeCallbackRef.current = cb ?? null;
    return channelInstance;
  });
});

describe("useRealtimeSubscription — subscribe lifecycle", () => {
  it("(1) on mount, calls supabase.channel(name) and .on('postgres_changes', ..., handler)", () => {
    renderHook(() =>
      useRealtimeSubscription({
        channel: "propiedades-changes",
        table: "propiedades",
        onPayload: vi.fn(),
      }),
    );

    expect(channelMock).toHaveBeenCalledWith("propiedades-changes");
    expect(channelInstance.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ event: "*", schema: "public", table: "propiedades" }),
      expect.any(Function),
    );
  });

  it("(2) on mount, calls .subscribe(callback) to receive status updates", () => {
    renderHook(() =>
      useRealtimeSubscription({
        channel: "c1",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    expect(channelInstance.subscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it("(3) when SUBSCRIBED status fires, isSubscribed=true and error=null", async () => {
    const { result } = renderHook(() =>
      useRealtimeSubscription({
        channel: "c1",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBeNull();

    // Trigger the subscribe callback
    act(() => {
      subscribeCallbackRef.current?.("SUBSCRIBED");
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("(4) when CHANNEL_ERROR status fires, isSubscribed=false and error is set", async () => {
    const { result } = renderHook(() =>
      useRealtimeSubscription({
        channel: "broken-channel",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    act(() => {
      subscribeCallbackRef.current?.("CHANNEL_ERROR");
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("broken-channel");
  });

  it("(5) when TIMED_OUT status fires, isSubscribed=false and error is set", async () => {
    const { result } = renderHook(() =>
      useRealtimeSubscription({
        channel: "slow-channel",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    act(() => {
      subscribeCallbackRef.current?.("TIMED_OUT");
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("slow-channel");
  });

  it("(6) when CLOSED status fires, isSubscribed=false and error stays null (graceful)", async () => {
    const { result } = renderHook(() =>
      useRealtimeSubscription({
        channel: "closed-channel",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    act(() => {
      subscribeCallbackRef.current?.("CLOSED");
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("(7) forwards filter to the .on() config when provided", () => {
    renderHook(() =>
      useRealtimeSubscription({
        channel: "filtered",
        table: "lotes",
        filter: "proyecto_id=eq.proy-1",
        onPayload: vi.fn(),
      }),
    );

    expect(channelInstance.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "*",
        schema: "public",
        table: "lotes",
        filter: "proyecto_id=eq.proy-1",
      }),
      expect.any(Function),
    );
  });

  it("(8) forwards explicit event type to the .on() config when provided (not default '*')", () => {
    renderHook(() =>
      useRealtimeSubscription({
        channel: "c1",
        table: "lotes",
        event: "INSERT",
        onPayload: vi.fn(),
      }),
    );

    expect(channelInstance.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({ event: "INSERT" }),
      expect.any(Function),
    );
  });

  it("(9) when the postgres_changes handler fires, it forwards the payload to onPayload", () => {
    let capturedHandler: ((payload: unknown) => void) | null = null;
    channelInstance.on.mockImplementation(
      (_event: string, _config: unknown, handler: (payload: unknown) => void) => {
        capturedHandler = handler;
        return channelInstance;
      },
    );

    const onPayload = vi.fn();
    renderHook(() =>
      useRealtimeSubscription({
        channel: "c1",
        table: "lotes",
        onPayload,
      }),
    );

    const fakePayload = {
      eventType: "INSERT",
      new: { id: "l1" },
      old: {},
      schema: "public",
      table: "lotes",
    };
    act(() => {
      capturedHandler?.(fakePayload);
    });

    expect(onPayload).toHaveBeenCalledWith(fakePayload);
  });

  it("(10) on unmount, calls channelInstance.unsubscribe()", () => {
    const { unmount } = renderHook(() =>
      useRealtimeSubscription({
        channel: "c1",
        table: "t1",
        onPayload: vi.fn(),
      }),
    );

    expect(channelInstance.unsubscribe).not.toHaveBeenCalled();
    unmount();
    expect(channelInstance.unsubscribe).toHaveBeenCalled();
  });
});
