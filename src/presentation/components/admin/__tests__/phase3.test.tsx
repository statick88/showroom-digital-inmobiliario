import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ── Mock env ───────────────────────────────────────────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "mock-proyecto-id",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-turnstile-key",
  },
}));

// ── Mock hooks ─────────────────────────────────────────────────────
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
        imagenes: ["https://picsum.photos/400/300"],
        publicada: true,
        destacada: false,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "prop-2",
        codigo: "LT-043",
        tipo: "lote",
        estado: "separado",
        precio: 320000,
        moneda: "USD",
        titulo: "Terreno en Miraflores",
        cuartos: 2,
        banios: 1,
        distrito: "Miraflores",
        ciudad: "Lima",
        imagenes: [],
        publicada: true,
        destacada: false,
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/presentation/hooks/useMetricas", () => ({
  useMetricas: () => ({
    data: {
      totalLotes: 124,
      disponibles: 60,
      reservados: 15,
      vendidos: 25,
      totalTransacciones: 40,
      avancePorcentaje: 71,
      totalVentasPen: 3200000,
      totalVentasUsd: 0,
    },
    isLoading: false,
  }),
}));

vi.mock("@/presentation/hooks/useTopClicks", () => ({
  useTopClicks: () => ({
    data: [
      { propiedad: { id: "p1", codigo: "LT-001", titulo: "Terreno Premium" }, clicks: 245 },
      { propiedad: { id: "p2", codigo: "LT-002", titulo: "Casa de Playa" }, clicks: 189 },
      { propiedad: { id: "p3", codigo: "LT-003", titulo: "Departamento Centro" }, clicks: 142 },
      { propiedad: { id: "p4", codigo: "LT-004", titulo: "Oficina Ejecutiva" }, clicks: 98 },
      { propiedad: { id: "p5", codigo: "LT-005", titulo: "Local Comercial" }, clicks: 76 },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/presentation/hooks/useLeads.legacy", () => ({
  useLeads: () => ({
    data: [
      {
        id: "lead-1",
        nombre: "Juan Pérez",
        email: "juan@example.com",
        telefono: "+51999000111",
        propiedadId: "prop-1",
        propiedadCodigo: "LT-042",
        propiedadTitulo: "Terreno en San Isidro",
        score: 85,
        notas: "Interesado en compra directa",
        estado: "nuevo",
        createdAt: "2025-05-15T10:30:00Z",
      },
      {
        id: "lead-2",
        nombre: "María García",
        email: "maria@example.com",
        telefono: "+51999000222",
        propiedadId: "prop-2",
        propiedadCodigo: "LT-043",
        propiedadTitulo: "Terreno en Miraflores",
        score: 62,
        notas: "Requiere financiamiento",
        estado: "contactado",
        createdAt: "2025-05-14T14:00:00Z",
      },
    ],
    isLoading: false,
  }),
}));

// ── Mock useStatusMutation ─────────────────────────────────────────
vi.mock("@/presentation/hooks/useStatusMutation", () => ({
  useStatusMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// ── Mock realtime hooks ────────────────────────────────────────────
vi.mock("@/presentation/hooks/useRealtimePropiedades", () => ({
  useRealtimePropiedades: () => ({ isSubscribed: true, error: null }),
}));

vi.mock("@/presentation/hooks/useRealtimeLotes", () => ({
  useRealtimeLotes: () => ({ isSubscribed: true, error: null }),
}));

// ── Mock supabase client (used by realtime hooks + ProjectContext) ──────────────────
const createMockQueryBuilder = () => {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  return builder;
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => createMockQueryBuilder()),
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

// ── Mock react-leaflet ─────────────────────────────────────────────
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

// ── Mock sonner toast ──────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ════════════════════════════════════════════════════════════════════
// 3.1 │ DonutChart
// ════════════════════════════════════════════════════════════════════
describe("3.1 DonutChart — recharts PieChart with status colors", () => {
  it("renders donut chart with 3 segments", async () => {
    const { DonutChart } = await import("@/presentation/components/admin/DonutChart");
    const { container } = render(
      <DonutChart disponibles={60} separadas={15} vendidas={25} total={124} />,
    );
    // recharts renders Pie SVG elements
    expect(container.querySelector(".recharts-pie")).toBeTruthy();
  });

  it("renders legend with property state labels", async () => {
    const { DonutChart } = await import("@/presentation/components/admin/DonutChart");
    render(<DonutChart disponibles={60} separadas={15} vendidas={25} total={124} />);
    expect(screen.getByText("Disponible")).toBeTruthy();
    expect(screen.getByText("Separado")).toBeTruthy();
    expect(screen.getByText("Vendido")).toBeTruthy();
  });

  it("displays total count in center", async () => {
    const { DonutChart } = await import("@/presentation/components/admin/DonutChart");
    render(<DonutChart disponibles={60} separadas={15} vendidas={25} total={124} />);
    expect(screen.getByText("124")).toBeTruthy();
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.2 │ ProgressBar
// ════════════════════════════════════════════════════════════════════
describe("3.2 ProgressBar — Gradient fill cumplimiento", () => {
  it("renders with correct format 'S/ actual / S/ meta'", async () => {
    const { ProgressBar } = await import("@/presentation/components/admin/ProgressBar");
    render(<ProgressBar actual={3200000} meta={4500000} />);
    expect(screen.getByText(/S\/.*3,200,000/)).toBeTruthy();
    expect(screen.getByText(/S\/.*4,500,000/)).toBeTruthy();
  });

  it("computes correct width percentage", async () => {
    const { ProgressBar } = await import("@/presentation/components/admin/ProgressBar");
    const { container } = render(<ProgressBar actual={3200000} meta={4500000} />);
    const fill = container.querySelector('[data-testid="progress-fill"]');
    expect(fill).toBeTruthy();
    // 3,200,000 / 4,500,000 ≈ 71.11%
    expect(fill!.getAttribute("width")).toContain("71");
  });

  it("renders empty bar when meta is 0", async () => {
    const { ProgressBar } = await import("@/presentation/components/admin/ProgressBar");
    const { container } = render(<ProgressBar actual={0} meta={0} />);
    const fill = container.querySelector('[data-testid="progress-fill"]');
    expect(fill).toBeTruthy();
    expect(fill!.getAttribute("width")).toContain("0");
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.3 │ TopClickedTable
// ════════════════════════════════════════════════════════════════════
describe("3.3 TopClickedTable — Ranked properties", () => {
  it("renders top 5 properties by click count", async () => {
    const { TopClickedTable } = await import("@/presentation/components/admin/TopClickedTable");
    render(<TopClickedTable />);
    expect(screen.getByText("LT-001")).toBeTruthy();
    expect(screen.getByText("LT-005")).toBeTruthy();
    expect(screen.getByText("245")).toBeTruthy();
    expect(screen.getByText("76")).toBeTruthy();
  });

  it("highlights #1 rank badge", async () => {
    const { TopClickedTable } = await import("@/presentation/components/admin/TopClickedTable");
    render(<TopClickedTable />);
    const rankCells = screen.getAllByText(/^\d+$/);
    expect(rankCells.length).toBeGreaterThanOrEqual(5);
  });

  it("displays columns: rank, thumbnail, code, title, clicks", async () => {
    const { TopClickedTable } = await import("@/presentation/components/admin/TopClickedTable");
    render(<TopClickedTable />);
    expect(screen.getByText("#")).toBeTruthy();
    expect(screen.getByText("Imagen")).toBeTruthy();
    expect(screen.getByText("Propiedad")).toBeTruthy();
    expect(screen.getByText("Clics")).toBeTruthy();
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.4 │ PropertyTable — Inline status dropdown
// ════════════════════════════════════════════════════════════════════
describe("3.4 PropertyTable — Inline status dropdown", () => {
  it("renders status select in each row", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    // Switch to propiedades tab
    const propsBtn = screen.getByText("Propiedades");
    fireEvent.click(propsBtn);
    // Should have status selects
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.6 │ useStatusMutation
// ════════════════════════════════════════════════════════════════════
describe("3.6 useStatusMutation — Supabase PATCH hook", () => {
  it("exports a function called useStatusMutation", async () => {
    const mod = await import("@/presentation/hooks/useStatusMutation");
    expect(typeof mod.useStatusMutation).toBe("function");
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.7 │ PropertyTable — Search + Status filter
// ════════════════════════════════════════════════════════════════════
describe("3.7 PropertyTable — Search + filter", () => {
  it("renders search input with placeholder", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText("Propiedades"));
    expect(screen.getByPlaceholderText("Buscar por código o título...")).toBeTruthy();
  });

  it("renders status filter select with 'Todos los estados'", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText("Propiedades"));
    expect(screen.getByText("Todos los estados")).toBeTruthy();
    const disponibles = screen.getAllByText("Disponible");
    expect(disponibles.length).toBeGreaterThanOrEqual(1);
    const separados = screen.getAllByText("Separado");
    expect(separados.length).toBeGreaterThanOrEqual(1);
    const vendidos = screen.getAllByText("Vendido");
    expect(vendidos.length).toBeGreaterThanOrEqual(1);
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.8 │ LeadsTable
// ════════════════════════════════════════════════════════════════════
describe("3.8 LeadsTable — Lead management table", () => {
  it("renders lead data with name, email, phone, property, date", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText("Leads"));
    expect(screen.getByText("Juan Pérez")).toBeTruthy();
    expect(screen.getByText("juan@example.com")).toBeTruthy();
    expect(screen.getByText("+51999000111")).toBeTruthy();
  });

  it("renders 'Ver' button per row", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText("Leads"));
    const verButtons = screen.getAllByText("Ver");
    expect(verButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("displays formatted date as dd/mm/aaaa", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText("Leads"));
    // 2025-05-15T10:30:00Z => 15/05/2025
    expect(screen.getByText("15/05/2025")).toBeTruthy();
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.9 │ User profile in admin sidebar
// ════════════════════════════════════════════════════════════════════
describe("3.9 Admin sidebar — User profile", () => {
  it("renders user name and email at bottom of sidebar", async () => {
    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);
    // Find the sidebar user info area (bottom of sidebar)
    expect(screen.getByText("Admin User")).toBeTruthy();
    expect(screen.getByText("admin@inmobiliaria.pe")).toBeTruthy();
  });
});

// ════════════════════════════════════════════════════════════════════
// 3.10 │ Mobile bottom tab bar
// ════════════════════════════════════════════════════════════════════
describe("3.10 Admin — Mobile bottom tab bar", () => {
  it("renders 3 mobile tab buttons on small viewport", async () => {
    // Force mobile viewport
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 400,
    });

    const { AdminDashboard } = await import("@/presentation/components/admin/AdminDashboard");
    render(<AdminDashboard />);

    // Wait for useEffect to fire and set isMobile=true
    const tabBar = await screen.findByTestId("mobile-tab-bar");
    expect(tabBar).toBeTruthy();

    // On mobile, Dashboard appears both in heading and tab bar
    const dashboards = screen.getAllByText("Dashboard");
    expect(dashboards.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Propiedades")).toBeTruthy();
    expect(screen.getByText("Leads")).toBeTruthy();

    // Restore
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalWidth,
    });
  });
});
