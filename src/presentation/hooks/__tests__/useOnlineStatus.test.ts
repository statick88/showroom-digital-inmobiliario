import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "../useOnlineStatus";

describe("useOnlineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns navigator.onLine initially", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("returns false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it("updates to true when online event fires", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    
    expect(result.current).toBe(true);
  });

  it("updates to false when offline event fires", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
    
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    
    expect(result.current).toBe(false);
  });

  it("cleans up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    
    const { unmount } = renderHook(() => useOnlineStatus());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
  });
});