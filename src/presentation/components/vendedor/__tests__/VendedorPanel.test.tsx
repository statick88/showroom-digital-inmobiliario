import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Tests for the `<VendedorPanel>` shell (T-4.2).
 *
 * Renders the seller's workspace:
 *   - Header with the seller's name from `useAuthStore`.
 *   - MapaLotes (via lazy import) — wrapped so we mock it.
 *   - MetricasPanel — mocked.
 *   - Placeholder where TransaccionesList will go (T-4.5).
 *
 * The panel does NOT do its own role-checking; the parent route
 * wraps it in `<RoleGuard rol="vendedor">` which is tested separately.
 *
 * Component test pattern (see phase3.test.tsx):
 *   - vi.mock("@/config/env")
 *   - vi.mock("@/presentation/hooks/usePropiedades.legacy")
 *   - vi.mock the lazy-loaded MapaLotes
 */

import { VendedorPanel } from "@/presentation/components/vendedor/VendedorPanel";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import type { VendedorProfile } from "@/domain/entities/vendedor";

// ── Mocks ──────────────────────────────────────────────────────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "proj-1",
  },
}));

// Mock MapaLotes (lazy-loaded). Includes a "click polygon" trigger so
// the T-4.4 ficha-rendering test can simulate a polygon click.
let mapaOnLoteClick: ((lote: unknown) => void) | null = null;
vi.mock("@/presentation/components/lotes/MapaLotes", () => ({
  MapaLotes: ({
    onLoteClick,
    modoVendedor,
  }: {
    onLoteClick: (lote: unknown) => void;
    modoVendedor?: boolean;
  }) => {
    mapaOnLoteClick = onLoteClick;
    return (
      <div data-testid="mapa-lotes" data-modo-vendedor={modoVendedor ? "true" : "false"}>
        Mapa (mocked)
      </div>
    );
  },
}));

// Mock MetricasPanel
vi.mock("@/presentation/components/map/MetricasPanel", () => ({
  MetricasPanel: () => <div data-testid="metricas-panel">Metricas (mocked)</div>,
}));

// Mock useLotes (used inside the shell for the placeholder map)
vi.mock("@/presentation/hooks/useLotes", () => ({
  useLotes: () => ({ data: [], isLoading: false }),
}));

// Mock useProyecto
vi.mock("@/presentation/hooks/useProyectos", () => ({
  useProyecto: () => ({
    data: { id: "proj-1", nombre: "Las Lomas de Ayacucho", coordenadasCentro: undefined },
    isLoading: false,
  }),
}));

// Mock FichaTecnicaLote (T-4.4) — render the vendor buttons as plain
// text so the test can assert on the click flow without pulling in the
// full modal.
vi.mock("@/presentation/components/lotes/FichaTecnicaLote", () => ({
  FichaTecnicaLote: ({ modoVendedor }: { modoVendedor?: boolean }) => (
    <div data-testid="ficha-tecnica" data-modo-vendedor={modoVendedor ? "true" : "false"}>
      <button>Reservar</button>
      <button>Vender</button>
      <button>Marcar Disponible</button>
    </div>
  ),
}));

// Mock TransaccionesList (T-4.5) so the panel test does not need
// the real list. We expose the vendedorId it received so the test
// can assert wiring.
let transListVendedorId: string | null | undefined = undefined;
vi.mock("@/presentation/components/vendedor/TransaccionesList", () => ({
  TransaccionesList: ({ vendedorId }: { vendedorId: string | null }) => {
    transListVendedorId = vendedorId;
    return <div data-testid="transacciones-list-stub">Transacciones (mocked)</div>;
  },
}));

function makeVendedor(overrides: Partial<VendedorProfile> = {}): VendedorProfile {
  return {
    id: "user-1",
    authUserId: "auth-1",
    email: "maria@inmobiliaria.pe",
    nombre: "María García",
    rol: "vendedor",
    telefono: undefined,
    activo: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.get(key) ?? null;
    },
    key(index) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

let memoryStorage: Storage;

beforeEach(() => {
  memoryStorage = makeMemoryStorage();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => memoryStorage,
  });
  memoryStorage.clear();
  transListVendedorId = undefined;
  useAuthStore.setState({
    id: null,
    authUserId: null,
    email: null,
    nombre: null,
    rol: null,
    proyectoId: null,
    sessionChecked: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("<VendedorPanel> (T-4.2) — shell", () => {
  it("(1) renders the seller name in the header from useAuthStore", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ nombre: "María García" }));

    render(<VendedorPanel />);
    expect(screen.getByText(/María García/)).toBeInTheDocument();
  });

  it("(2) renders the MapaLotes section", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor());

    render(<VendedorPanel />);
    expect(screen.getByTestId("mapa-lotes")).toBeInTheDocument();
  });

  it("(3) renders the MetricasPanel", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor());

    render(<VendedorPanel />);
    expect(screen.getByTestId("metricas-panel")).toBeInTheDocument();
  });

  it("(4) renders the TransaccionesList and forwards the vendedor id from the auth store", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ id: "user-1" }));

    render(<VendedorPanel />);
    expect(screen.getByTestId("transacciones-list-stub")).toBeInTheDocument();
    expect(transListVendedorId).toBe("user-1");
  });

  it("(5) the panel works for admin role too (RoleGuard passes admin through)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "admin", nombre: "Admin" }));

    render(<VendedorPanel />);
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
    expect(screen.getByTestId("mapa-lotes")).toBeInTheDocument();
  });

  it("(6) the seller name header is wrapped in an element with the data-testid='vendedor-header'", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ nombre: "María García" }));

    render(<VendedorPanel />);
    const header = screen.getByTestId("vendedor-header");
    expect(within(header).getByText(/María García/)).toBeInTheDocument();
  });
});

describe("<VendedorPanel> (T-4.4) — FichaTecnicaLote with modoVendedor", () => {
  it("(T-4.4.1) clicking a polygon opens FichaTecnicaLote with modoVendedor=true (vendor buttons rendered)", async () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ nombre: "María García" }));

    render(<VendedorPanel />);
    // Before click: no ficha.
    expect(screen.queryByRole("button", { name: /Reservar/i })).not.toBeInTheDocument();

    // Simulate polygon click.
    mapaOnLoteClick?.({ id: "lote-1", codigo: "LT-001", estado: "disponible" });
    // The ficha is lazy-loaded; wait for it to mount.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Reservar/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /Vender/i })).toBeInTheDocument();
  });

  it("(T-4.4.2) the MapaLotes in the panel is rendered with modoVendedor=true", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor());

    render(<VendedorPanel />);
    const mapa = screen.getByTestId("mapa-lotes");
    expect(mapa.getAttribute("data-modo-vendedor")).toBe("true");
  });
});
