import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useParcelsForTour } from "@/presentation/hooks/useParcelsForTour";
import { useVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { useLotes } from "@/presentation/hooks/useLotes";
import type { VirtualTour } from "@/domain/entities/virtual-tour";
import type { Lote } from "@/domain/entities/lote";

vi.mock("@/presentation/hooks/use-virtual-tour", () => ({
  useVirtualTour: vi.fn(),
}));

vi.mock("@/presentation/hooks/useLotes", () => ({
  useLotes: vi.fn(),
}));

vi.mock("@/presentation/hooks/useRealtimeLotes", () => ({
  useRealtimeLotes: vi.fn(() => ({})),
}));

// ── Fixtures ───────────────────────────────────────────────────────
const mockTour: VirtualTour = {
  id: "tour-abc",
  proyectoId: "proy-1",
  nombre: "Tour Ayacucho",
  escenas: [
    {
      id: "scene-1",
      textureUrl: "tex.ktx2",
      thumbnailUrl: "thumb.jpg",
      yaw: 0,
      pitch: 0,
      fov: 75,
      panoramaCenter: { lat: -13.163, lng: -74.224 },
    },
  ],
  escenaInicialId: "scene-1",
  metadatos: {},
  estado: "publicado",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockLotes: Lote[] = [
  {
    id: "lote-1",
    proyectoId: "proy-1",
    codigo: "L-01",
    areaTotal: 150,
    precio: 125000,
    moneda: "PEN",
    estado: "disponible",
    poligonoCoords: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    orden: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function mockTourData(tour: VirtualTour | undefined, isLoading = false) {
  vi.mocked(useVirtualTour).mockReturnValue({
    data: tour,
    isLoading,
    isError: false,
  } as any);
}

function mockLotesData(lotes: Lote[] | undefined, isLoading = false) {
  vi.mocked(useLotes).mockReturnValue({
    data: lotes,
    isLoading,
  } as any);
}

// ── Happy path ─────────────────────────────────────────────────────
describe("useParcelsForTour", () => {
  beforeEach(() => {
    mockTourData(mockTour);
    mockLotesData(mockLotes);
  });

  it("returns parcels from useLotes", () => {
    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.parcels).toEqual(mockLotes);
  });

  it("returns panoramaCenter from initial scene", () => {
    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.panoramaCenter).toEqual({ lat: -13.163, lng: -74.224 });
  });

  it("returns isLoading=false when both queries succeed", () => {
    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(false);
  });
});

// ── Edge cases ─────────────────────────────────────────────────────
describe("useParcelsForTour — edge cases", () => {
  it("returns empty parcels when tour has no panoramaCenter", () => {
    mockTourData({
      ...mockTour,
      escenas: [{ ...mockTour.escenas[0], panoramaCenter: undefined }],
    });
    mockLotesData(mockLotes);

    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.parcels).toEqual([]);
  });

  it("returns null panoramaCenter when tour has no scenes", () => {
    mockTourData({ ...mockTour, escenas: [] });
    mockLotesData(mockLotes);

    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.panoramaCenter).toBeNull();
  });

  it("returns isLoading=true while tour is loading", () => {
    mockTourData(undefined, true);
    mockLotesData(undefined, true);

    const { result } = renderHook(
      () => useParcelsForTour("tour-abc"),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
  });
});
