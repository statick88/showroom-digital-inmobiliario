import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Propiedad, EstadoPropiedad, TipoPropiedad } from "@/domain/entities/propiedad";

// ── Mock localStorage for useWhatsApp ──────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ── Mock env to prevent "Missing required env var" ──────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "mock-proyecto-id",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-turnstile-key",
  },
}));

// ── Mock Hook: usePropiedades ──────────────────────────────────────
vi.mock("@/presentation/hooks/usePropiedades.legacy", () => ({
  usePropiedades: () => ({
    data: [
      {
        id: "prop-1",
        codigo: "LT-042",
        tipo: "lote",
        estado: "disponible",
        precio: 450000,
        moneda: "PEN",
        titulo: "Terreno en San Isidro",
        descripcion: "Hermoso terreno",
        areaM2: 200,
        cuartos: 3,
        banios: 2,
        ubicacion: { x: -76.9967, y: -12.1354 },
        distrito: "San Isidro",
        ciudad: "Lima",
        imagenes: ["https://picsum.photos/400/300", "https://picsum.photos/400/301"],
        publicada: true,
        destacada: false,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ],
    isLoading: false,
  }),
}));

// ── Mock useClickTracker ───────────────────────────────────────────
vi.mock("@/presentation/hooks/useClickTracker", () => ({
  useClickTracker: () => ({
    trackClick: vi.fn(),
    isTracking: false,
  }),
}));

vi.mock("@/presentation/hooks/useRealtimePropiedades", () => ({
  useRealtimePropiedades: () => ({ isSubscribed: true, error: null }),
}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((cb) => {
          cb?.("SUBSCRIBED");
          return { unsubscribe: vi.fn() };
        }),
        unsubscribe: vi.fn(),
      })),
    })),
  },
}));

// ── Mock Propiedad factory ─────────────────────────────────────────
function makeProp(overrides: Partial<Propiedad> = {}): Propiedad {
  return {
    id: "prop-1",
    codigo: "LT-042",
    tipo: "lote" as TipoPropiedad,
    estado: "disponible" as EstadoPropiedad,
    precio: 450000,
    moneda: "PEN",
    titulo: "Terreno en San Isidro",
    descripcion: "Hermoso terreno",
    areaM2: 200,
    cuartos: 3,
    banios: 2,
    ubicacion: { x: -76.9967, y: -12.1354 },
    distrito: "San Isidro",
    ciudad: "Lima",
    imagenes: ["https://picsum.photos/400/300", "https://picsum.photos/400/301"],
    publicada: true,
    destacada: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

const mockPropDisponible = makeProp();
const mockPropSeparado = makeProp({ estado: "separado" });
const mockPropVendido = makeProp({ estado: "vendido", moneda: "USD", precio: 120000 });

// ── Mocks for react-leaflet ────────────────────────────────────────
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="circle-marker" data-props={JSON.stringify(props)}>
      {children as React.ReactNode}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="leaflet-popup">{children}</div>
  ),
  useMap: () => ({ flyTo: vi.fn(), locate: vi.fn() }),
  useMapEvents: () => ({}),
}));

// ── 2.1 │ MapView: Desktop split layout & mobile stack ──────────────
describe("2.1 MapView — Layout", () => {
  it("Desktop: renders CSS Grid layout", async () => {
    const { MapView } = await import("@/presentation/components/map/MapView");
    render(<MapView />);
    // Renders sidebar section
    const sidebar = screen.queryByTestId("property-list-sidebar");
    expect(sidebar).toBeTruthy();
    // Renders map container
    expect(screen.getByTestId("map-container")).toBeTruthy();
  });
});

// ── 2.2 │ HeaderNav: Brand + Admin button ───────────────────────────
describe("2.2 HeaderNav — Brand + Admin button", () => {
  it("renders 'Showroom Inmobiliario' brand text on the left", async () => {
    const { HeaderNav } = await import("@/presentation/components/map/HeaderNav");
    render(<HeaderNav />);
    expect(screen.getByText("Showroom Inmobiliario")).toBeTruthy();
  });

  it("renders Admin button with Lock icon on the right", async () => {
    const { HeaderNav } = await import("@/presentation/components/map/HeaderNav");
    render(<HeaderNav />);
    const adminBtn = screen.getByRole("button", { name: /admin/i });
    expect(adminBtn).toBeTruthy();
    const lockIcon = adminBtn.querySelector("svg");
    expect(lockIcon).toBeTruthy();
  });
});

// ── 2.3 │ PropertyFilters ──────────────────────────────────────────
describe("2.3 PropertyFilters — Filter bar", () => {
  it("renders filter fields", async () => {
    const { PropertyFilters } = await import("@/presentation/components/map/PropertyFilters");
    const onFilterChange = vi.fn();
    render(
      <PropertyFilters
        filters={{ tipo: "", estado: "", distrito: "", precioMin: "", precioMax: "", moneda: "" }}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByText("Filtros")).toBeTruthy();
    expect(screen.getByText("Tipo")).toBeTruthy();
    expect(screen.getByText("Estado")).toBeTruthy();
  });

  it("renders 'Limpiar filtros' when filters are active", async () => {
    const { PropertyFilters } = await import("@/presentation/components/map/PropertyFilters");
    const onFilterChange = vi.fn();
    render(
      <PropertyFilters
        filters={{
          tipo: "lote",
          estado: "",
          distrito: "",
          precioMin: "",
          precioMax: "",
          moneda: "",
        }}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByText("Limpiar filtros")).toBeTruthy();
  });
});

// ── 2.5 │ MarkerPopup: thumbnail, price, badge, Ver detalle ────────
describe("2.5 MarkerPopup — Popup content", () => {
  it("renders 'Ver detalle' button", async () => {
    const { MarkerPopup } = await import("@/presentation/components/map/MarkerPopup");
    render(<MarkerPopup propiedad={mockPropDisponible} />);
    expect(screen.getByText("Ver detalle")).toBeTruthy();
  });

  it("renders price with currency symbol", async () => {
    const { MarkerPopup } = await import("@/presentation/components/map/MarkerPopup");
    render(<MarkerPopup propiedad={mockPropDisponible} />);
    expect(screen.getByText(/S\//)).toBeTruthy();
  });

  it("renders Disponible badge for disponible status", async () => {
    const { MarkerPopup } = await import("@/presentation/components/map/MarkerPopup");
    render(<MarkerPopup propiedad={mockPropDisponible} />);
    expect(screen.getByText("Disponible")).toBeTruthy();
  });
});

// ── 2.6 │ GlassControls: zoom, geolocation, layer toggle ────────────
describe("2.6 GlassControls — Controls", () => {
  it("renders zoom +/- buttons", async () => {
    const { GlassControls } = await import("@/presentation/components/map/GlassControls");
    const { container } = render(<GlassControls />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ── 2.7 │ PropertyDetailPanel: desktop modal + mobile slide ────────
describe("2.7 PropertyDetailPanel — Detail panel", () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("renders when open with property data", async () => {
    const { PropertyDetailPanel } =
      await import("@/presentation/components/detail/PropertyDetailPanel");
    render(<PropertyDetailPanel propiedad={mockPropDisponible} isOpen={true} onClose={vi.fn()} />, { wrapper });
    // Use getAllByText — both desktop and mobile versions render in jsdom
    const contactBtns = screen.getAllByText("Contactar");
    expect(contactBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render when closed", async () => {
    const { PropertyDetailPanel } =
      await import("@/presentation/components/detail/PropertyDetailPanel");
    const { container } = render(
      <PropertyDetailPanel propiedad={mockPropDisponible} isOpen={false} onClose={vi.fn()} />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("");
  });

  it("includes HeroImage with gradient overlay", async () => {
    const { PropertyDetailPanel } =
      await import("@/presentation/components/detail/PropertyDetailPanel");
    render(<PropertyDetailPanel propiedad={mockPropDisponible} isOpen={true} onClose={vi.fn()} />, { wrapper });
    const codes = screen.getAllByText("LT-042");
    expect(codes.length).toBeGreaterThanOrEqual(1);
  });

  it("includes CTA 'Contactar' button", async () => {
    const { PropertyDetailPanel } =
      await import("@/presentation/components/detail/PropertyDetailPanel");
    render(<PropertyDetailPanel propiedad={mockPropDisponible} isOpen={true} onClose={vi.fn()} />, { wrapper });
    const contactBtns = screen.getAllByText("Contactar");
    expect(contactBtns.length).toBeGreaterThanOrEqual(1);
  });
});

// ── 2.8 │ HeroImage: 192px, gradient, price+code+badge ─────────────
describe("2.8 HeroImage — Hero with overlay", () => {
  it("renders 192px height container", async () => {
    const { HeroImage } = await import("@/presentation/components/map/HeroImage");
    const { container } = render(<HeroImage propiedad={mockPropDisponible} />);
    const heroEl = container.firstElementChild as HTMLElement;
    expect(heroEl.className).toContain("h-[192px]");
  });

  it("renders price and property code over gradient overlay", async () => {
    const { HeroImage } = await import("@/presentation/components/map/HeroImage");
    render(<HeroImage propiedad={mockPropDisponible} />);
    expect(screen.getByText("LT-042")).toBeTruthy();
  });

  it("renders status badge area", async () => {
    const { HeroImage } = await import("@/presentation/components/map/HeroImage");
    const { container } = render(<HeroImage propiedad={mockPropDisponible} />);
    const badgeArea = container.querySelector('[data-testid="hero-badge-area"]');
    expect(badgeArea).toBeTruthy();
  });
});

// ── 2.9 │ SpecsGrid: 3-column, icons ───────────────────────────────
describe("2.9 SpecsGrid — Property specs grid", () => {
  it("renders 3-column grid", async () => {
    const { SpecsGrid } = await import("@/presentation/components/detail/SpecsGrid");
    const { container } = render(<SpecsGrid propiedad={mockPropDisponible} />);
    const gridEl = container.querySelector('[class*="grid"]');
    expect(gridEl).toBeTruthy();
  });

  it("displays area m² with Ruler icon", async () => {
    const { SpecsGrid } = await import("@/presentation/components/detail/SpecsGrid");
    render(<SpecsGrid propiedad={mockPropDisponible} />);
    expect(screen.getByText("200")).toBeTruthy();
    expect(screen.getByText("m²")).toBeTruthy();
  });

  it("displays bedrooms with Bed icon", async () => {
    const { SpecsGrid } = await import("@/presentation/components/detail/SpecsGrid");
    render(<SpecsGrid propiedad={mockPropDisponible} />);
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("displays bathrooms with Bath icon", async () => {
    const { SpecsGrid } = await import("@/presentation/components/detail/SpecsGrid");
    render(<SpecsGrid propiedad={mockPropDisponible} />);
    expect(screen.getByText("2")).toBeTruthy();
  });
});

// ── 2.10 │ Gallery: horizontal scroll thumbnails ───────────────────
describe("2.10 Gallery — Thumbnail gallery", () => {
  it("renders horizontal scroll container", async () => {
    const { Gallery } = await import("@/presentation/components/map/Gallery");
    const { container } = render(<Gallery propiedad={mockPropDisponible} />);
    const scrollEl = container.querySelector('[class*="overflow-x-auto"]');
    expect(scrollEl).toBeTruthy();
  });

  it("renders thumbnails from propiedad.imagenes", async () => {
    const { Gallery } = await import("@/presentation/components/map/Gallery");
    render(<Gallery propiedad={mockPropDisponible} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });
});
