import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MapaLotes } from "@/presentation/components/lotes/MapaLotes";
import type { Lote } from "@/domain/entities/lote";
import { createMockUseClickTracker } from "@/test-utils/mockUseClickTracker";
import { makeLoteListFixture, makeLoteFixture } from "@/test-utils/mockLotesRepository";

// ── Mock react-leaflet ────────────────────────────────────────────
let geoJsonClickHandlers: Array<(e?: unknown) => void> = [];

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({
    eventHandlers,
    data,
  }: {
    eventHandlers?: { click?: (e?: unknown) => void };
    data: unknown;
  }) => {
    // Capture the click handler so tests can fire it directly
    geoJsonClickHandlers.push(eventHandlers?.click ?? (() => {}));
    const feature = data as { geometry?: { coordinates?: number[][][] } };
    const coords = feature?.geometry?.coordinates?.[0] ?? [];
    return (
      <div
        data-testid="geojson-polygon"
        data-coord-count={coords.length}
        onClick={() => eventHandlers?.click?.()}
      />
    );
  },
  useMap: () => ({ setView: vi.fn(), getZoom: () => 17 }),
}));

// ── Mock useLotes and useProyecto ──────────────────────────────────
const useLotesMock = vi.fn();
const useLotesPorVendedorMock = vi.fn();
vi.mock("@/presentation/hooks/useLotes", () => ({
  useLotes: (...args: unknown[]) => useLotesMock(...args),
  useLotesPorVendedor: (...args: unknown[]) => useLotesPorVendedorMock(...args),
}));

const useProyectoMock = vi.fn();
vi.mock("@/presentation/hooks/useProyectos", () => ({
  useProyecto: (...args: unknown[]) => useProyectoMock(...args),
}));

// ── Mock useClickTracker ───────────────────────────────────────────
const tracker = createMockUseClickTracker();
vi.mock("@/presentation/hooks/useClickTracker", () => ({
  useClickTracker: () => tracker,
}));

// ── Mock env ───────────────────────────────────────────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "proy-1",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-key",
  },
}));

// ── Mock map sub-components to keep the test focused on MapaLotes ─
vi.mock("@/presentation/components/map/GlassControls", () => ({
  GlassControls: () => <div data-testid="glass-controls" />,
}));
vi.mock("@/presentation/components/map/MasterPlanOverlay", () => ({
  MasterPlanOverlay: () => null,
}));

beforeEach(() => {
  tracker.trackClick.mockClear();
  geoJsonClickHandlers = [];
  useLotesMock.mockReset();
  useLotesPorVendedorMock.mockReset();
  useProyectoMock.mockReset();
  // Default: useProyecto returns the project center
  useProyectoMock.mockReturnValue({
    data: {
      id: "proy-1",
      nombre: "Mock Project",
      coordenadasCentro: { lat: -13.163, lng: -74.224 },
      imagenes360: [],
      activo: true,
      createdAt: "",
      updatedAt: "",
    },
  });
  // T-4.3: useLotesPorVendedor is also called (always, by MapaLotes).
  // Default to a no-op result so the destructuring does not crash.
  useLotesPorVendedorMock.mockReturnValue({ data: [], isLoading: false, error: null });
});

describe("MapaLotes — retro tests (T-1.2, PR-1 foundations)", () => {
  it("(1) renders N lot polygons for N lotes in useLotes() result", () => {
    const lotes = makeLoteListFixture(3);
    useLotesMock.mockReturnValue({ data: lotes, isLoading: false, error: null });

    render(<MapaLotes onLoteClick={vi.fn()} />);

    // Each lote maps to a <GeoJSON> -> rendered as our mock "geojson-polygon"
    const polygons = screen.getAllByTestId("geojson-polygon");
    expect(polygons).toHaveLength(3);
  });

  it("(2) click on a polygon invokes onLoteClick with that lot", () => {
    const lotes = makeLoteListFixture(2);
    useLotesMock.mockReturnValue({ data: lotes, isLoading: false, error: null });
    const onLoteClick = vi.fn();

    render(<MapaLotes onLoteClick={onLoteClick} />);

    // Fire the captured click handler for the second polygon
    geoJsonClickHandlers[1]?.();
    expect(onLoteClick).toHaveBeenCalledTimes(1);
    expect(onLoteClick).toHaveBeenCalledWith(lotes[1]);
  });

  it("(4) loading state shows 'Cargando mapa...' skeleton", () => {
    useLotesMock.mockReturnValue({ data: undefined, isLoading: true, error: null });

    render(<MapaLotes onLoteClick={vi.fn()} />);

    expect(screen.getByText("Cargando mapa...")).toBeInTheDocument();
    // The map container should NOT be rendered while loading
    expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
  });

  it("(extra) passes filtros.estado to useLotes when filtroEstado prop is given", () => {
    useLotesMock.mockReturnValue({ data: [], isLoading: false, error: null });

    render(<MapaLotes onLoteClick={vi.fn()} filtroEstado="disponible" />);

    // The hook should be called with (proyectoId, { estado: "disponible" })
    expect(useLotesMock).toHaveBeenCalledWith("proy-1", { estado: "disponible" });
  });
});

describe("MapaLotes — [TODO] future scenarios (land in PR-3 / PR-4)", () => {
  // Spec T-1.2 acceptance scenario (3): trackClick(lote.id, 'click') is
  // called fire-and-forget on polygon click. Current implementation has no
  // useClickTracker import. Implementation lands in PR-3 (T-3.2 GAP-3).
  it.todo("trackClick(lote.id, 'click') is called fire-and-forget on click (PR-3 T-3.2)");

  // Spec T-1.2 acceptance scenario (5): error state shows retry button.
  // Current implementation has no error branch. The retry pattern lands in
  // PR-3 alongside click tracking.
  it.todo("error state shows retry button (PR-3 alongside T-3.2)");
});
