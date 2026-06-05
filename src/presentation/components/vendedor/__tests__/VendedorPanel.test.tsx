import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

// Mock MapaLotes (lazy-loaded)
vi.mock("@/presentation/components/lotes/MapaLotes", () => ({
  MapaLotes: () => <div data-testid="mapa-lotes">Mapa (mocked)</div>,
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

  it("(4) renders the TransaccionesList placeholder (T-4.5 will replace it)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor());

    render(<VendedorPanel />);
    // The placeholder copy or a data-testid is acceptable; we use
    // a data-testid so the next commit can replace it without breaking
    // the test.
    expect(screen.getByTestId("transacciones-placeholder")).toBeInTheDocument();
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
