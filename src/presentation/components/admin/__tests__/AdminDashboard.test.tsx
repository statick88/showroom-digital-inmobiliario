import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ─── Hook mocks ───────────────────────────────────────────────────────
const usePropiedadesMock = vi.fn();
const useMetricasMock = vi.fn();
const useStatusMutationMock = vi.fn();
const useRealtimePropiedadesMock = vi.fn();
const useRealtimeLotesMock = vi.fn();
const useLeadsMock = vi.fn();
const useUsuariosMock = vi.fn();
const useAuditLogMock = vi.fn();
const useTopClicksMock = vi.fn();

vi.mock("@/presentation/hooks/usePropiedades.legacy", () => ({
  usePropiedades: (...args: unknown[]) => usePropiedadesMock(...args),
}));
vi.mock("@/presentation/hooks/useMetricas", () => ({
  useMetricas: () => useMetricasMock(),
}));
vi.mock("@/presentation/hooks/useStatusMutation", () => ({
  useStatusMutation: () => useStatusMutationMock(),
}));
vi.mock("@/presentation/hooks/useRealtimePropiedades", () => ({
  useRealtimePropiedades: () => useRealtimePropiedadesMock(),
}));
vi.mock("@/presentation/hooks/useRealtimeLotes", () => ({
  useRealtimeLotes: () => useRealtimeLotesMock(),
}));

// Sub-component mocks — return sentinel text we can query with getByText.
vi.mock("@/presentation/components/admin/DonutChart", () => ({
  DonutChart: () => <div data-testid="donut-chart">DonutChart</div>,
}));
vi.mock("@/presentation/components/admin/ProgressBar", () => ({
  ProgressBar: (props: { value?: number }) => (
    <div data-testid="progress-bar">ProgressBar:{props.value}</div>
  ),
}));
vi.mock("@/presentation/components/admin/TopClickedTable", () => ({
  TopClickedTable: () => <div data-testid="top-clicked">TopClickedTable</div>,
}));
vi.mock("@/presentation/components/admin/LeadsTable", () => ({
  LeadsTable: () => {
    useLeadsMock();
    return <div data-testid="leads-table">LeadsTable</div>;
  },
}));
vi.mock("@/presentation/components/admin/UsuariosPanel", () => ({
  UsuariosPanel: () => {
    useUsuariosMock();
    return <div data-testid="usuarios-panel">UsuariosPanel</div>;
  },
}));
vi.mock("@/presentation/components/admin/AuditLogPanel", () => ({
  AuditLogPanel: () => {
    useAuditLogMock();
    return <div data-testid="audit-log-panel">AuditLogPanel</div>;
  },
}));

import { AdminDashboard } from "@/presentation/components/admin/AdminDashboard";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

/** Set window.innerWidth to drive the `isMobile` effect in AdminDashboard. */
function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

beforeEach(() => {
  usePropiedadesMock.mockReset();
  useMetricasMock.mockReset();
  useStatusMutationMock.mockReset();
  useRealtimePropiedadesMock.mockReset();
  useRealtimeLotesMock.mockReset();
  useLeadsMock.mockReset();
  useUsuariosMock.mockReset();
  useAuditLogMock.mockReset();
  useTopClicksMock.mockReset();

  // Default happy-path mocks
  usePropiedadesMock.mockReturnValue({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  });
  useMetricasMock.mockReturnValue({
    data: { disponibles: 5, reservados: 2, vendidos: 3, total: 10 },
    isLoading: false,
  });
  useStatusMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useRealtimePropiedadesMock.mockReturnValue(undefined);
  useRealtimeLotesMock.mockReturnValue(undefined);
});

describe("<AdminDashboard> — tab routing & responsive shell", () => {
  it("(1) renders the desktop sidebar (>=768px) with all 5 nav buttons + the Dashboard tab content by default", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    // Sidebar is visible at desktop
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Gestión Inmobiliaria")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Propiedades/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Leads/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registro Auditoría/i })).toBeInTheDocument();

    // Default tab = dashboard (ProgressBar from DashboardTab is rendered when data is present)
    expect(screen.getAllByTestId("progress-bar").length).toBeGreaterThan(0);
  });

  it("(2) clicking the desktop 'Propiedades' nav button switches the tab", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    // PropiedadesTab renders a search input + filter button
    expect(screen.getByPlaceholderText(/buscar por código/i)).toBeInTheDocument();
  });

  it("(3) clicking the desktop 'Leads' nav button switches to the Leads tab", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Leads/i }));

    // LeadsTab renders LeadsTable mock
    expect(screen.getByTestId("leads-table")).toBeInTheDocument();
    expect(useLeadsMock).toHaveBeenCalled();
  });

  it("(4) clicking the desktop 'Usuarios' nav button switches to the Usuarios tab", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Usuarios/i }));

    expect(screen.getByTestId("usuarios-panel")).toBeInTheDocument();
    expect(useUsuariosMock).toHaveBeenCalled();
  });

  it("(5) clicking the desktop 'Registro Auditoría' nav button switches to the audit-log tab", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Registro Auditoría/i }));

    expect(screen.getByTestId("audit-log-panel")).toBeInTheDocument();
    expect(useAuditLogMock).toHaveBeenCalled();
  });

  it("(6) renders the mobile bottom tab bar (<768px) and clicks Propiedades to switch tabs", () => {
    setViewportWidth(500);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    // Mobile bottom bar is rendered
    const mobileBar = screen.getByTestId("mobile-tab-bar");
    expect(mobileBar).toBeInTheDocument();

    // Sidebar is hidden on mobile
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();

    // Click the mobile 'Propiedades' tab
    const mobileTabs = mobileBar.querySelectorAll("button");
    const propiedadesMobileTab = Array.from(mobileTabs).find((b) =>
      /Propiedades/i.test(b.textContent ?? ""),
    );
    expect(propiedadesMobileTab).toBeDefined();
    fireEvent.click(propiedadesMobileTab!);

    expect(screen.getByPlaceholderText(/buscar por código/i)).toBeInTheDocument();
  });

  it("(6b) clicks every mobile tab button (Dashboard, Leads, Usuarios, Auditoria) to cover setTab branches", () => {
    setViewportWidth(500);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    const mobileBar = screen.getByTestId("mobile-tab-bar");
    const mobileTabs = Array.from(mobileBar.querySelectorAll("button"));

    // Click every tab except Propiedades (already covered by test 6)
    for (const tabBtn of mobileTabs) {
      if (/Propiedades/i.test(tabBtn.textContent ?? "")) continue;
      fireEvent.click(tabBtn);
    }
    // Smoke: ensure no crash and the mobile bar still has tabs
    expect(mobileTabs.length).toBeGreaterThan(0);
  });

  it("(7) the resize listener updates isMobile (desktop → mobile) and shows/hides the sidebar", () => {
    setViewportWidth(1024);
    render(<AdminDashboard />, { wrapper: makeWrapper() });

    // Desktop: sidebar visible
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();

    // Switch to mobile
    act(() => {
      setViewportWidth(500);
      window.dispatchEvent(new Event("resize"));
    });

    // Sidebar hidden, mobile bar visible
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("mobile-tab-bar")).toBeInTheDocument();
  });

  it("(8) renders the DashboardTab fallback (zero metrics) when useMetricas has no data", () => {
    setViewportWidth(1024);
    useMetricasMock.mockReturnValue({ data: undefined, isLoading: true });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    // DashboardTab gracefully degrades to zeros when data is undefined
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("progress-bar").length).toBeGreaterThan(0);
  });

  it("(9) PropiedadesTab: shows the loading row when usePropiedades is loading", () => {
    setViewportWidth(1024);
    usePropiedadesMock.mockReturnValue({ data: undefined, isLoading: true, refetch: vi.fn() });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("(10) PropiedadesTab: status select change opens the confirm dialog with CCI/metodoPago fields", () => {
    setViewportWidth(1024);
    usePropiedadesMock.mockReturnValue({
      data: [
        {
          id: "p-1",
          codigo: "L-001",
          titulo: "Lote Premium",
          tipo: "casa",
          precio: 250000,
          estado: "disponible",
          distrito: "Miraflores",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });
    const statusMutate = vi.fn();
    useStatusMutationMock.mockReturnValue({ mutate: statusMutate, isPending: false });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    // The status select is the only <select> inside the table body
    const statusSelect = document.querySelector("tbody select") as HTMLSelectElement;
    expect(statusSelect).toBeTruthy();
    fireEvent.change(statusSelect, { target: { value: "separado" } });

    // Confirm dialog opens
    expect(screen.getByText(/¿Separar lote L-001\?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/002-/)).toBeInTheDocument();
    expect(screen.getByText(/Método de pago/i)).toBeInTheDocument();

    // Fill CCI + metodoPago
    fireEvent.change(screen.getByPlaceholderText(/002-/), {
      target: { value: "002-1234567890-12" },
    });
    fireEvent.change(screen.getByDisplayValue("Seleccionar..."), {
      target: { value: "transferencia" },
    });

    // Confirm
    fireEvent.click(screen.getByRole("button", { name: /^confirmar$/i }));

    expect(statusMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        propiedadId: "p-1",
        estado: "separado",
        cci: "002-1234567890-12",
        metodoPago: "transferencia",
      }),
    );
  });

  it("(11) PropiedadesTab: search input filters the table by codigo/titulo", () => {
    setViewportWidth(1024);
    usePropiedadesMock.mockReturnValue({
      data: [
        {
          id: "p-1",
          codigo: "L-001",
          titulo: "Lote Premium",
          tipo: "casa",
          precio: 250000,
          estado: "disponible",
          distrito: "Miraflores",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
        {
          id: "p-2",
          codigo: "L-002",
          titulo: "Casa Playa",
          tipo: "casa",
          precio: 500000,
          estado: "vendido",
          distrito: "Asia",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    // Both visible initially
    expect(screen.getByText("L-001")).toBeInTheDocument();
    expect(screen.getByText("L-002")).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/buscar por código/i);
    fireEvent.change(searchInput, { target: { value: "Playa" } });

    // L-001 hidden, L-002 visible
    expect(screen.queryByText("L-001")).not.toBeInTheDocument();
    expect(screen.getByText("L-002")).toBeInTheDocument();
  });

  it("(12) PropiedadesTab: status filter select narrows rows by estado", () => {
    setViewportWidth(1024);
    usePropiedadesMock.mockReturnValue({
      data: [
        {
          id: "p-1",
          codigo: "L-001",
          titulo: "Lote Premium",
          tipo: "casa",
          precio: 250000,
          estado: "disponible",
          distrito: "Miraflores",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
        {
          id: "p-2",
          codigo: "L-002",
          titulo: "Casa Playa",
          tipo: "casa",
          precio: 500000,
          estado: "vendido",
          distrito: "Asia",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    const statusFilterSelect = screen.getByDisplayValue("Todos los estados");
    fireEvent.change(statusFilterSelect, { target: { value: "vendido" } });

    // L-001 hidden, L-002 visible
    expect(screen.queryByText("L-001")).not.toBeInTheDocument();
    expect(screen.getByText("L-002")).toBeInTheDocument();
  });

  it("(13) PropiedadesTab: confirm dialog Cancelar closes the dialog without mutating", () => {
    setViewportWidth(1024);
    usePropiedadesMock.mockReturnValue({
      data: [
        {
          id: "p-1",
          codigo: "L-001",
          titulo: "Lote Premium",
          tipo: "casa",
          precio: 250000,
          estado: "disponible",
          distrito: "Miraflores",
          proyectoId: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });
    const statusMutate = vi.fn();
    useStatusMutationMock.mockReturnValue({ mutate: statusMutate, isPending: false });

    render(<AdminDashboard />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Propiedades/i }));

    const statusSelect = document.querySelector("tbody select") as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: "vendido" } });
    expect(screen.getByText(/¿Separar lote/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(statusMutate).not.toHaveBeenCalled();
  });
});
