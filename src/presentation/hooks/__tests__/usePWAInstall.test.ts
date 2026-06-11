import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePWAInstall } from "../usePWAInstall";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
  };
})();

// Mock matchMedia
const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe("usePWAInstall", () => {
  let mockPrompt: ReturnType<typeof vi.fn>;
  let mockUserChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });
    localStorageMock.clear();

    // Setup matchMedia mock
    Object.defineProperty(window, "matchMedia", {
      value: mockMatchMedia,
      writable: true,
    });

    // Setup mock prompt
    mockPrompt = vi.fn().mockResolvedValue(undefined);
    mockUserChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns isInstallable: false initially", () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it("sets isInstallable to true when beforeinstallprompt fires", () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn(), writable: true });
      Object.defineProperty(event, "prompt", { value: mockPrompt, writable: true });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice, writable: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it("stores deferred prompt and allows install", async () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn(), writable: true });
      Object.defineProperty(event, "prompt", { value: mockPrompt, writable: true });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice, writable: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.install();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
  });

  it("sets isInstalled to true after successful install", async () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn(), writable: true });
      Object.defineProperty(event, "prompt", { value: mockPrompt, writable: true });
      Object.defineProperty(event, "userChoice", {
        value: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
        writable: true,
      });
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.install();
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("dismisses prompt and stores in localStorage", () => {
    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn(), writable: true });
      Object.defineProperty(event, "prompt", { value: mockPrompt, writable: true });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice, writable: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isInstallable).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("pwa-install-dismissed", "true");
  });

  it("does not show prompt if previously dismissed", () => {
    localStorageMock.getItem.mockReturnValue("true");

    const { result } = renderHook(() => usePWAInstall());

    act(() => {
      const event = new Event("beforeinstallprompt");
      Object.defineProperty(event, "preventDefault", { value: vi.fn(), writable: true });
      Object.defineProperty(event, "prompt", { value: mockPrompt, writable: true });
      Object.defineProperty(event, "userChoice", { value: mockUserChoice, writable: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(false);
  });

  it("does not show prompt if already installed (standalone mode)", () => {
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it("cleans up event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => usePWAInstall());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeinstallprompt", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("appinstalled", expect.any(Function));
  });

  it("sets isInstalled to true on appinstalled event", () => {
    // Ensure not in standalone mode
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });
});
