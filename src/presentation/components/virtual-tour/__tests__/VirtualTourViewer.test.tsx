import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

import { VirtualTourViewer } from "@/presentation/components/virtual-tour/VirtualTourViewer";
import type { VirtualTour } from "@/domain/entities/virtual-tour";
import type { Lote } from "@/domain/entities/lote";

// ── Mock useVirtualTour ────────────────────────────────────────────
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

vi.mock("@/presentation/hooks/use-virtual-tour", () => ({
  useVirtualTour: vi.fn(() => ({
    data: mockTour,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/presentation/hooks/useParcelsForTour", () => ({
  useParcelsForTour: vi.fn(() => ({
    parcels: [],
    panoramaCenter: null,
    isLoading: false,
  })),
}));

// ── Mock lazy-loaded components ────────────────────────────────────
vi.mock("@/presentation/components/virtual-tour/VirtualTourSkeleton", () => ({
  VirtualTourSkeleton: () => <div data-testid="tour-skeleton" />,
}));

vi.mock("@/presentation/components/virtual-tour/VirtualTourErrorBoundary", () => ({
  VirtualTourErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/presentation/components/virtual-tour/VirtualTourCompass", () => ({
  VirtualTourCompass: () => <div data-testid="tour-compass" />,
}));

vi.mock("@/presentation/components/virtual-tour/VirtualTourCanvas", () => ({
  VirtualTourCanvas: (props: any) => (
    <div data-testid="tour-canvas" data-props={JSON.stringify({
      hasParcels: !!props.parcels?.length,
      hasCenter: !!props.panoramaCenter,
    })} />
  ),
}));

vi.mock("@/presentation/components/virtual-tour/ParcelDetailPanel", () => ({
  ParcelDetailPanel: (props: any) => (
    <div data-testid="parcel-detail-panel" data-is-open={props.isOpen} />
  ),
}));

import { useVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { useParcelsForTour } from "@/presentation/hooks/useParcelsForTour";

afterEach(() => {
  cleanup();
});

// ── Tests ──────────────────────────────────────────────────────────
describe("VirtualTourViewer", () => {
  it("shows skeleton while loading", () => {
    vi.mocked(useVirtualTour).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<VirtualTourViewer tourId="tour-abc" />);
    expect(screen.getByTestId("tour-skeleton")).toBeInTheDocument();
  });

  it("shows error when tour fails to load", () => {
    vi.mocked(useVirtualTour).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    render(<VirtualTourViewer tourId="tour-abc" />);
    expect(screen.getByText("Tour no disponible")).toBeInTheDocument();
  });

  it("renders VirtualTourCanvas when tour is loaded", async () => {
    vi.mocked(useVirtualTour).mockReturnValue({
      data: mockTour,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<VirtualTourViewer tourId="tour-abc" />);
    await waitFor(() => {
      expect(screen.getByTestId("tour-canvas")).toBeInTheDocument();
    });
  });

  it("passes parcels and panoramaCenter to VirtualTourCanvas", () => {
    const lote: Lote = {
      id: "lote-1",
      proyectoId: "proy-1",
      codigo: "L-01",
      areaTotal: 150,
      precio: 125000,
      moneda: "PEN",
      estado: "disponible",
      poligonoCoords: [],
      orden: 1,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    vi.mocked(useVirtualTour).mockReturnValue({
      data: mockTour,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useParcelsForTour).mockReturnValue({
      parcels: [lote],
      panoramaCenter: { lat: -13.163, lng: -74.224 },
      isLoading: false,
    });

    render(<VirtualTourViewer tourId="tour-abc" />);
    const canvas = screen.getByTestId("tour-canvas");
    const props = JSON.parse(canvas.getAttribute("data-props")!);
    expect(props.hasParcels).toBe(true);
    expect(props.hasCenter).toBe(true);
  });

  it("shows ParcelDetailPanel when a parcel is clicked", () => {
    const lote: Lote = {
      id: "lote-1",
      proyectoId: "proy-1",
      codigo: "L-01",
      areaTotal: 150,
      precio: 125000,
      moneda: "PEN",
      estado: "disponible",
      poligonoCoords: [],
      orden: 1,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    vi.mocked(useVirtualTour).mockReturnValue({
      data: mockTour,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useParcelsForTour).mockReturnValue({
      parcels: [lote],
      panoramaCenter: { lat: -13.163, lng: -74.224 },
      isLoading: false,
    });

    render(<VirtualTourViewer tourId="tour-abc" />);
    const panel = screen.getByTestId("parcel-detail-panel");
    expect(panel).toBeInTheDocument();
    expect(panel.getAttribute("data-is-open")).toBe("false");
  });
});
