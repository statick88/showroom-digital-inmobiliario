import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Tests for `<UsuariosPanel>` (T-5.1, HU-009).
 *
 * Scope of T-5.1 (PR-5 first slice):
 *   - The table renders the rows from `useUsuarios()`.
 *   - A "Crear vendedor" button exists and opens the CrearVendedorDialog.
 *   - An "Editar" button per row opens the EditarVendedorDialog with the
 *     pre-filled row.
 *
 * CrearVendedorDialog and EditarVendedorDialog are tested in their own
 * test files (T-5.2 and T-5.3). To keep this test focused on T-5.1 we
 * stub the dialogs out and assert they get the right props.
 */

// ── Mock env so `import { env } from "@/config/env"` resolves ────────
vi.mock("@/config/env", () => ({
  env: {
    proyectoId: "mock-proyecto-id",
    supabaseUrl: "https://mock.supabase.co",
    supabaseKey: "mock-key",
    masterPlanImageUrl: "",
    turnstileSiteKey: "mock-turnstile-key",
    agenciaId: "mock-agencia-id",
  },
}));

import { UsuariosPanel } from "@/presentation/components/admin/UsuariosPanel";
import type { VendedorProfile } from "@/domain/entities/vendedor";

const mockUseUsuarios = vi.fn();
const useCrearVendedorMock = vi.fn();
const useActualizarVendedorMock = vi.fn();
const useDesactivarVendedorMock = vi.fn();

vi.mock("@/presentation/hooks/useUsuarios", () => ({
  useUsuarios: () => mockUseUsuarios(),
  useCrearVendedor: () => useCrearVendedorMock(),
  useActualizarVendedor: () => useActualizarVendedorMock(),
  useDesactivarVendedor: () => useDesactivarVendedorMock(),
}));

vi.mock("@/presentation/components/admin/CrearVendedorDialog", () => ({
  CrearVendedorDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
  }) =>
    open ? (
      <div data-testid="crear-vendedor-dialog-stub">
        <button data-testid="crear-dialog-close" onClick={() => onOpenChange(false)}>
          Cerrar
        </button>
      </div>
    ) : null,
}));

vi.mock("@/presentation/components/admin/EditarVendedorDialog", () => ({
  EditarVendedorDialog: ({
    open,
    onOpenChange,
    vendedor,
  }: {
    open: boolean;
    onOpenChange: (next: boolean) => void;
    vendedor: VendedorProfile | null;
  }) =>
    open ? (
      <div data-testid="editar-vendedor-dialog-stub" data-vendedor-id={vendedor?.id ?? ""}>
        <button data-testid="editar-dialog-close" onClick={() => onOpenChange(false)}>
          Cerrar
        </button>
      </div>
    ) : null,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function makeVendedor(overrides: Partial<VendedorProfile> = {}): VendedorProfile {
  return {
    id: "user-1",
    authUserId: "auth-1",
    email: "maria@showroom.pe",
    nombre: "María García",
    rol: "vendedor",
    telefono: "+51999000111",
    activo: true,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  mockUseUsuarios.mockReset();
  useCrearVendedorMock.mockReset();
  useActualizarVendedorMock.mockReset();
  useDesactivarVendedorMock.mockReset();
  useCrearVendedorMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useActualizarVendedorMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useDesactivarVendedorMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseUsuarios.mockReturnValue({
    data: [makeVendedor()],
    isLoading: false,
  });
});

describe("<UsuariosPanel> (T-5.1) — admin user management table", () => {
  it("(1) renders the vendedor rows from useUsuarios() in a table", () => {
    mockUseUsuarios.mockReturnValue({
      data: [
        makeVendedor({ id: "u-1", email: "a@x.com", nombre: "Ada", rol: "admin" }),
        makeVendedor({ id: "u-2", email: "b@x.com", nombre: "Beto", rol: "vendedor" }),
      ],
      isLoading: false,
    });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    expect(screen.getByText("a@x.com")).toBeInTheDocument();
    expect(screen.getByText("b@x.com")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Beto")).toBeInTheDocument();
  });

  it("(2) renders a 'Crear vendedor' button that opens the CrearVendedorDialog", () => {
    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    // Dialog stub is not visible before clicking
    expect(screen.queryByTestId("crear-vendedor-dialog-stub")).not.toBeInTheDocument();

    const crearBtn = screen.getByRole("button", { name: /crear vendedor/i });
    fireEvent.click(crearBtn);

    expect(screen.getByTestId("crear-vendedor-dialog-stub")).toBeInTheDocument();
  });

  it("(3) renders an 'Editar' button per row that opens the EditarVendedorDialog with the row pre-filled", () => {
    mockUseUsuarios.mockReturnValue({
      data: [
        makeVendedor({ id: "u-1", email: "a@x.com", nombre: "Ada" }),
        makeVendedor({ id: "u-2", email: "b@x.com", nombre: "Beto" }),
      ],
      isLoading: false,
    });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    // Dialog stub not visible yet
    expect(screen.queryByTestId("editar-vendedor-dialog-stub")).not.toBeInTheDocument();

    // Find the row for "a@x.com" and click its Editar button
    const rows = screen.getAllByTestId("usuario-row");
    expect(rows).toHaveLength(2);

    const firstRow = rows[0]!;
    const editarBtn = within(firstRow).getByRole("button", { name: /editar/i });
    fireEvent.click(editarBtn);

    const dialog = screen.getByTestId("editar-vendedor-dialog-stub");
    // The dialog is pre-filled with the row's id
    expect(dialog.getAttribute("data-vendedor-id")).toBe("u-1");
  });

  it("(4) shows a loading skeleton while useUsuarios is loading", () => {
    mockUseUsuarios.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    expect(screen.getByTestId("usuarios-skeleton")).toBeInTheDocument();
  });

  it("(5) shows an empty state when there are no usuarios_rol rows", () => {
    mockUseUsuarios.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<UsuariosPanel />, { wrapper: makeWrapper() });

    expect(screen.getByTestId("usuarios-empty")).toBeInTheDocument();
  });
});
