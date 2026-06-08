import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the lead-events repository
vi.mock("@/data/repositories", () => ({
  leadEventsRepository: {
    registrar: vi.fn().mockResolvedValue({
      id: "evt-1",
      visitorId: "visitor-1",
      propertyId: "prop-123",
      eventType: "whatsapp_click",
      metadata: {},
      createdAt: "2026-01-01T00:00:00Z",
    }),
  },
}));

import { useWhatsApp } from "@/presentation/hooks/useWhatsApp";
import { leadEventsRepository } from "@/data/repositories";

const mockRegistrar = vi.mocked(leadEventsRepository.registrar);

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear() { map.clear(); },
    getItem(key) { return map.get(key) ?? null; },
    key(index) { return Array.from(map.keys())[index] ?? null; },
    removeItem(key) { map.delete(key); },
    setItem(key, value) { map.set(key, value); },
  };
}

describe("useWhatsApp", () => {
  let memoryStorage: Storage;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
    memoryStorage = createMemoryStorage();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => memoryStorage,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns openWhatsApp function and isTracking=false initially", () => {
    const { result } = renderHook(
      () => useWhatsApp("Departamento Miraflores", 450000, "51999888777", "prop-123"),
      { wrapper: createWrapper() },
    );

    expect(typeof result.current.openWhatsApp).toBe("function");
    expect(result.current.isTracking).toBe(false);
  });

  it("openWhatsApp opens wa.me URL with correct encoded message", () => {
    const { result } = renderHook(
      () => useWhatsApp("Departamento Miraflores", 450000, "51999888777", "prop-123"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openWhatsApp();
    });

    const expectedMessage =
      'Hola, me interesa "Departamento Miraflores" a S/450000. ¿Podría darme más información?';
    const expectedUrl = `https://wa.me/51999888777?text=${encodeURIComponent(expectedMessage)}`;

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(expectedUrl, "_blank");
  });

  it("openWhatsApp tracks click event via lead-events repository", async () => {
    const { result } = renderHook(
      () => useWhatsApp("Departamento Miraflores", 450000, "51999888777", "prop-123"),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      result.current.openWhatsApp();
    });

    expect(mockRegistrar).toHaveBeenCalledTimes(1);
    expect(mockRegistrar).toHaveBeenCalledWith({
      visitorId: expect.any(String),
      propertyId: "prop-123",
      eventType: "whatsapp_click",
      metadata: expect.objectContaining({
        propertyName: "Departamento Miraflores",
        price: 450000,
      }),
    });
  });

  it("generates correct URL for different prices", () => {
    const { result } = renderHook(
      () => useWhatsApp("Casa San Isidro", 1200000, "519888777666", "prop-456"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openWhatsApp();
    });

    const expectedMessage =
      'Hola, me interesa "Casa San Isidro" a S/1200000. ¿Podría darme más información?';
    const expectedUrl = `https://wa.me/519888777666?text=${encodeURIComponent(expectedMessage)}`;

    expect(window.open).toHaveBeenCalledWith(expectedUrl, "_blank");
  });

  it("generates correct URL with special characters in property name", () => {
    const { result } = renderHook(
      () => useWhatsApp("Depto. Lima Centro - 2do Piso", 350000, "519111222333", "prop-789"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openWhatsApp();
    });

    expect(window.open).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(window.open).mock.calls[0];
    expect(callArgs).toBeDefined();
    const url = callArgs![0] as string;
    expect(url).toContain("wa.me/519111222333");
    expect(url).toContain("text=");
    expect(url).toMatch(/^https:\/\/wa\.me\/519111222333\?text=.+$/);
  });
});
