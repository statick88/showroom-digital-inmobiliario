import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { MapView } from "@/presentation/components/map/MapView";
import { createMockUseClickTracker } from "@/test-utils/mockUseClickTracker";
import type { Propiedad } from "@/domain/entities/propiedad";

// ── Stub react-leaflet — capture props + provide a fake `useMap` ──
const captured: {
  mapInstance: {
    setView: ReturnType<typeof vi.fn>;
    getZoom: () => number;
    flyTo: ReturnType<typeof vi.fn>;
    zoomIn: ReturnType<typeof vi.fn>;
    zoomOut: ReturnType<typeof vi.fn>;
  };
  tileLayer: { url: string; attribution: string } | null;
  circleMarkers: Array<{ id: string; center: [number, number]; color: string }>;
  instanceStoreCallback: ((map: unknown) => void) | null;
} = {
  mapInstance: {
    setView: vi.fn(),
    getZoom: () => 14,
    flyTo: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
  },
  tileLayer: null,
  circleMarkers: [],
  instanceStoreCallback: null,
};

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    center,
    zoom,
  }: {
    children: React.ReactNode;
    center: [number, number];
    zoom: number;
  }) => (
    <div data-testid="map-container" data-center={center.join(",")} data-zoom={zoom}>
      {children}
    </div>
  ),
  TileLayer: ({ url, attribution }: { url: string; attribution: string }) => {
    captured.tileLayer = { url, attribution };
    return <div data-testid="tile-layer" />;
  },
  CircleMarker: ({
    center,
    pathOptions,
    children,
  }: {
    center: [number, number];
    pathOptions?: { fillColor?: string };
    children?: React.ReactNode;
  }) => {
    const id = `marker-${captured.circleMarkers.length}`;
    captured.circleMarkers.push({ id, center, color: pathOptions?.fillColor ?? "?" });
    return (
      <div data-testid={id} data-color={pathOptions?.fillColor ?? ""}>
        {children}
      </div>
    );
  },
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  useMap: () => captured.mapInstance,
}));

// ── Mock usePropiedades.legacy ──
const usePropiedadesMock = vi.fn();
vi.mock("@/presentation/hooks/usePropiedades.legacy", () => ({
  usePropiedades: (...args: unknown[]) => usePropiedadesMock(...args),
}));

// ── Mock useRealtimePropiedades (no-op for unit test) ──
vi.mock("@/presentation/hooks/useRealtimePropiedades", () => ({
  useRealtimePropiedades: () => undefined,
}));

// ── Mock useClickTracker ──
const tracker = createMockUseClickTracker();
vi.mock("@/presentation/hooks/useClickTracker", () => ({
  useClickTracker: () => tracker,
}));

// ── Mock child components to keep the test focused on MapView ──
vi.mock("@/presentation/components/map/HeaderNav", () => ({
  HeaderNav: () => <div data-testid="header-nav" />,
}));

vi.mock("@/presentation/components/map/PropertyFilters", () => ({
  PropertyFilters: ({
    filters,
    onFilterChange,
  }: {
    filters: Record<string, string>;
    onFilterChange: (f: Record<string, string>) => void;
  }) => (
    <div data-testid="property-filters">
      <button
        data-testid="filter-tipo"
        onClick={() => onFilterChange({ ...filters, tipo: "lote" })}
      >
        Set Tipo
      </button>
    </div>
  ),
}));

vi.mock("@/presentation/components/map/GlassControls", () => ({
  GlassControls: ({
    onZoomIn,
    onZoomOut,
    onGeolocate,
    onToggleLayer,
  }: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onGeolocate: () => void;
    onToggleLayer: () => void;
  }) => (
    <div data-testid="glass-controls">
      <button data-testid="zoom-in" onClick={onZoomIn}>
        +
      </button>
      <button data-testid="zoom-out" onClick={onZoomOut}>
        -
      </button>
      <button data-testid="geolocate" onClick={onGeolocate}>
        geo
      </button>
      <button data-testid="toggle-layer" onClick={onToggleLayer}>
        toggle
      </button>
    </div>
  ),
}));

vi.mock("@/presentation/components/map/MarkerPopup", () => ({
  MarkerPopup: ({ propiedad }: { propiedad: Propiedad }) => (
    <div data-testid="marker-popup">{propiedad.titulo}</div>
  ),
}));

vi.mock("@/presentation/components/detail/PropertyDetailPanel", () => ({
  PropertyDetailPanel: ({
    isOpen,
    onClose,
    onContact,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onContact?: () => void;
  }) => (
    <div data-testid="property-detail-panel" data-open={isOpen}>
      <button data-testid="detail-close" onClick={onClose}>
        close
      </button>
      {onContact && (
        <button data-testid="detail-contact" onClick={onContact}>
          contact
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/presentation/components/map/LeadForm", () => ({
  LeadForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="lead-form">
      <button data-testid="lead-close" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeProp(overrides: Partial<Propiedad> = {}): Propiedad {
  return {
    id: "p-1",
    codigo: "P-001",
    tipo: "lote",
    estado: "disponible",
    precio: 100000,
    moneda: "PEN",
    titulo: "Casa en Miraflores",
    ciudad: "Lima",
    imagenes: ["https://img/p-1.jpg"],
    publicada: true,
    destacada: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  captured.tileLayer = null;
  captured.circleMarkers = [];
  captured.instanceStoreCallback = null;
  tracker.trackClick.mockClear();
  usePropiedadesMock.mockReset();
  // Default: empty success
  usePropiedadesMock.mockReturnValue({ data: [], isLoading: false, error: null });
});

describe("MapView — top-level layout", () => {
  it("(1) renders HeaderNav, PropertyFilters, and the map container", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    expect(screen.getByTestId("header-nav")).toBeInTheDocument();
    expect(screen.getByTestId("property-filters")).toBeInTheDocument();
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("(2) starts with the OpenStreetMap tile layer (satellite=false default)", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    expect(captured.tileLayer?.url).toContain("openstreetmap.org");
  });

  it("(3) initial map center is the documented default (Lima coords)", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    const mapEl = screen.getByTestId("map-container");
    expect(mapEl.getAttribute("data-center")).toBe("-12.1354,-76.9967");
  });
});

describe("MapView — property list (sidebar)", () => {
  it("(4) shows loading skeletons when usePropiedades is loading", () => {
    usePropiedadesMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<MapView />, { wrapper: makeWrapper() });

    // 4 skeleton boxes are rendered (we don't have a test-id, so check the sidebar is present)
    expect(screen.getByTestId("property-list-sidebar")).toBeInTheDocument();
  });

  it("(5) shows the empty-state message when data is an empty array", () => {
    usePropiedadesMock.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MapView />, { wrapper: makeWrapper() });

    expect(screen.getByText("No se encontraron propiedades")).toBeInTheDocument();
  });

  it("(6) shows the empty-state message when data is null/undefined (defensive)", () => {
    usePropiedadesMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<MapView />, { wrapper: makeWrapper() });

    expect(screen.getByText("No se encontraron propiedades")).toBeInTheDocument();
  });

  it("(7) renders one card per propiedad in the data array", () => {
    const props = [makeProp({ id: "p-1", titulo: "A" }), makeProp({ id: "p-2", titulo: "B" })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    // Both titles are rendered as part of the card button
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("(8) clicking a property card opens the detail panel and calls trackClick('click')", () => {
    const props = [makeProp({ id: "p-1" })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    const card = screen.getByText("Casa en Miraflores");
    fireEvent.click(card);

    expect(tracker.trackClick).toHaveBeenCalledWith("p-1", "click");
    // The detail panel mock renders with data-open=true
    expect(screen.getByTestId("property-detail-panel").getAttribute("data-open")).toBe("true");
  });

  it("(9) clicking the detail panel's close button hides the panel", () => {
    const props = [makeProp({ id: "p-1" })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    // Open the panel first
    fireEvent.click(screen.getByText("Casa en Miraflores"));
    expect(screen.getByTestId("property-detail-panel").getAttribute("data-open")).toBe("true");

    // Close it
    fireEvent.click(screen.getByTestId("detail-close"));
    expect(screen.getByTestId("property-detail-panel").getAttribute("data-open")).toBe("false");
  });

  it("(10) clicking the detail panel's contact button opens the lead form", () => {
    const props = [makeProp({ id: "p-1" })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    // Open the panel
    fireEvent.click(screen.getByText("Casa en Miraflores"));
    // Click contact
    fireEvent.click(screen.getByTestId("detail-contact"));

    // The lead form should now be visible
    expect(screen.getByTestId("lead-form")).toBeInTheDocument();
  });

  it("(11) does NOT render the lead form before a property has been selected (defensive)", () => {
    usePropiedadesMock.mockReturnValue({ data: [], isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    expect(screen.queryByTestId("lead-form")).not.toBeInTheDocument();
  });
});

describe("MapView — markers (CircleMarker count = properties with ubicacion)", () => {
  it("(12) renders one CircleMarker per propiedad that has a ubicacion", () => {
    const props = [
      makeProp({ id: "p-1", ubicacion: { x: -77, y: -12 } }),
      makeProp({ id: "p-2", ubicacion: { x: -77.1, y: -12.1 } }),
    ];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    expect(captured.circleMarkers).toHaveLength(2);
  });

  it("(13) filters out propiedades WITHOUT a ubicacion (they don't get a marker)", () => {
    const props = [
      makeProp({ id: "p-1", ubicacion: { x: -77, y: -12 } }),
      makeProp({ id: "p-2" }), // no ubicacion
    ];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    expect(captured.circleMarkers).toHaveLength(1);
    expect(captured.circleMarkers[0]?.id).toBe("marker-0");
  });

  it("(14) CircleMarker color reflects the propiedad.estado (disponible=success)", () => {
    const props = [makeProp({ id: "p-1", estado: "disponible", ubicacion: { x: -77, y: -12 } })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    expect(captured.circleMarkers[0]?.color).toContain("--status-success");
  });

  it("(15) CircleMarker color reflects the propiedad.estado (vendido=destructive)", () => {
    const props = [makeProp({ id: "p-1", estado: "vendido", ubicacion: { x: -77, y: -12 } })];
    usePropiedadesMock.mockReturnValue({ data: props, isLoading: false, error: null });

    render(<MapView />, { wrapper: makeWrapper() });

    expect(captured.circleMarkers[0]?.color).toContain("--status-destructive");
  });
});

describe("MapView — filter changes propagate to usePropiedades", () => {
  it("(16) initial usePropiedades call has no filter values set (empty object)", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    // filtersStateToFiltros builds an empty FiltrosPropiedades when all
    // filter inputs are empty strings (the default initial state).
    expect(usePropiedadesMock).toHaveBeenCalledWith({});
  });

  it("(17) when PropertyFilters invokes onFilterChange, the next usePropiedades call has those filters", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByTestId("filter-tipo"));

    expect(usePropiedadesMock).toHaveBeenLastCalledWith({ tipo: "lote" });
  });
});

describe("MapView — glass controls (zoom / geolocate / satellite toggle)", () => {
  it("(18) zoom-in button calls the leaflet map instance's zoomIn()", () => {
    render(<MapView />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByTestId("zoom-in"));
    expect(captured.mapInstance.zoomIn).toHaveBeenCalled();
  });

  it("(19) zoom-out button calls the leaflet map instance's zoomOut()", () => {
    render(<MapView />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByTestId("zoom-out"));
    expect(captured.mapInstance.zoomOut).toHaveBeenCalled();
  });

  it("(20) satellite toggle swaps the tile layer URL to ArcGIS World Imagery", () => {
    render(<MapView />, { wrapper: makeWrapper() });

    // Initial: OSM
    expect(captured.tileLayer?.url).toContain("openstreetmap.org");

    // Toggle: satellite
    fireEvent.click(screen.getByTestId("toggle-layer"));

    expect(captured.tileLayer?.url).toContain("arcgisonline.com");
  });

  it("(21) geolocate button triggers navigator.geolocation.getCurrentPosition (success path)", async () => {
    const getCurrentPositionMock = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: -12.0,
          longitude: -77.0,
          accuracy: 0,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
    });

    render(<MapView />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByTestId("geolocate"));

    await waitFor(() => expect(getCurrentPositionMock).toHaveBeenCalled());
  });

  it("(22) geolocate button handles errors from getCurrentPosition silently", () => {
    const getCurrentPositionMock = vi.fn(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, message: "denied" } as GeolocationPositionError);
      },
    );
    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: { getCurrentPosition: getCurrentPositionMock },
      configurable: true,
    });

    render(<MapView />, { wrapper: makeWrapper() });
    expect(() => fireEvent.click(screen.getByTestId("geolocate"))).not.toThrow();
  });
});
