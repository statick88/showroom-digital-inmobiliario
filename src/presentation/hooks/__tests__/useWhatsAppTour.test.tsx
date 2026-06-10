import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useWhatsAppTour, buildTourMessage } from "@/presentation/hooks/useWhatsAppTour";
import type { Lote } from "@/domain/entities/lote";

// ── Mock leadEventsRepository ──────────────────────────────────────
vi.mock("@/data/repositories", () => ({
  leadEventsRepository: {
    registrar: vi.fn().mockResolvedValue(undefined),
  },
}));

// ── Fixture ────────────────────────────────────────────────────────
const baseLote: Lote = {
  id: "lote-abc-123",
  proyectoId: "proy-1",
  codigo: "LT-042",
  areaTotal: 200,
  frente: 10,
  fondo: 20,
  precio: 450000,
  moneda: "PEN",
  estado: "disponible",
  poligonoCoords: [],
  orden: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

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

beforeEach(() => {
  vi.spyOn(window, "open").mockImplementation(() => null);
  const memoryStorage = createMemoryStorage();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => memoryStorage,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── buildTourMessage (pure function) ──────────────────────────────
describe("buildTourMessage — pure function", () => {
  it("includes parcel code in message", () => {
    const msg = buildTourMessage(baseLote, "tour-abc");
    expect(msg).toContain("LT-042");
  });

  it("includes area in m²", () => {
    const msg = buildTourMessage(baseLote, "tour-abc");
    expect(msg).toContain("200 m²");
  });

  it("formats price with S/ for PEN currency", () => {
    const msg = buildTourMessage(baseLote, "tour-abc");
    expect(msg).toContain("S/ 450,000");
  });

  it("formats price with $ for USD currency", () => {
    const usdLote = { ...baseLote, moneda: "USD" as const, precio: 120000 };
    const msg = buildTourMessage(usdLote, "tour-abc");
    expect(msg).toContain("$ 120,000");
  });

  it("includes tour deep link with tourId and parcel code", () => {
    const msg = buildTourMessage(baseLote, "tour-abc");
    expect(msg).toContain("?tour=tour-abc");
    expect(msg).toContain("#parcel=LT-042");
  });

  it("includes origin in tour link", () => {
    const msg = buildTourMessage(baseLote, "tour-abc");
    expect(msg).toContain("localhost");
  });
});

// ── useWhatsAppTour (hook) ────────────────────────────────────────
describe("useWhatsAppTour — hook", () => {
  it("opens WhatsApp with tour-enriched message", () => {
    const { result } = renderHook(
      () => useWhatsAppTour(baseLote, "tour-abc"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openWhatsApp();
    });

    expect(window.open).toHaveBeenCalledTimes(1);
    const calledUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("wa.me");
    expect(calledUrl).toContain(encodeURIComponent("LT-042"));
    expect(calledUrl).toContain(encodeURIComponent("200 m²"));
    expect(calledUrl).toContain(encodeURIComponent("S/ 450,000"));
    expect(calledUrl).toContain(encodeURIComponent("?tour=tour-abc"));
    expect(calledUrl).toContain(encodeURIComponent("#parcel=LT-042"));
  });

  it("formats USD price correctly in URL", () => {
    const usdLote = { ...baseLote, moneda: "USD" as const, precio: 120000 };
    const { result } = renderHook(
      () => useWhatsAppTour(usdLote, "tour-abc"),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.openWhatsApp();
    });

    const calledUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent("$ 120,000"));
  });

  it("returns isTracking=false initially", () => {
    const { result } = renderHook(
      () => useWhatsAppTour(baseLote, "tour-abc"),
      { wrapper: createWrapper() },
    );

    expect(result.current.isTracking).toBe(false);
  });
});
