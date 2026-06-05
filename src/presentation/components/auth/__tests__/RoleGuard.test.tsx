import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Tests for the `<RoleGuard>` component (T-4.2).
 *
 * The guard renders children when the current user's role matches
 * `rol` (or is admin — admins pass every guard). When the user does
 * not match, it:
 *   - Shows a toast: "Acceso restringido" if they are auth'd but wrong role.
 *   - Shows a toast: "Debes iniciar sesion" if `sessionChecked` is true
 *     but the user is unauthenticated.
 *   - Redirects to `#showroom`.
 *   - Does NOT render the children.
 *
 * The actual hashchange is mocked; the toast is mocked.
 */

import { RoleGuard } from "@/presentation/components/auth/RoleGuard";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import type { VendedorProfile } from "@/domain/entities/vendedor";

// ── Mocks ──────────────────────────────────────────────────────────
const toastErrorMock = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

// Mock window.location.hash manipulation
const originalLocation = window.location;
let hashValue = "";
const hashAssignMock = vi.fn((v: string) => {
  hashValue = v;
});
Object.defineProperty(window, "location", {
  configurable: true,
  get: () => ({
    ...originalLocation,
    hash: hashValue,
    assign: hashAssignMock,
  }),
});

function makeVendedor(overrides: Partial<VendedorProfile> = {}): VendedorProfile {
  return {
    id: "user-1",
    authUserId: "auth-1",
    email: "x@x.com",
    nombre: "X",
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
  hashValue = "";
  toastErrorMock.mockReset();
  // Reset the store
  useAuthStore.setState({
    id: null,
    authUserId: null,
    email: null,
    nombre: null,
    rol: null,
    proyectoId: null,
    sessionChecked: true, // default to "checked" so we test the post-load path
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("<RoleGuard rol='vendedor'>", () => {
  it("(1) admin role: renders children (admins pass every guard)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "admin" }));

    render(
      <RoleGuard rol="vendedor">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("(2) vendedor role: renders children", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "vendedor" }));

    render(
      <RoleGuard rol="vendedor">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("(3) comprador role: does NOT render children, fires 'Acceso restringido' toast", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "comprador" }));

    render(
      <RoleGuard rol="vendedor">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Acceso restringido",
      expect.objectContaining({ description: expect.any(String) }),
    );
  });

  it("(4) unauthenticated (sessionChecked: true, rol: null): fires 'Debes iniciar sesion' toast and does NOT render children", () => {
    // sessionChecked is true (set in beforeEach), rol is null
    render(
      <RoleGuard rol="vendedor">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Debes iniciar sesion",
      expect.objectContaining({ description: expect.any(String) }),
    );
  });

  it("(5) session not yet checked (sessionChecked: false): does NOT render anything, does NOT show a toast (waits for hydration)", () => {
    useAuthStore.setState({ sessionChecked: false, rol: null });

    const { container } = render(
      <RoleGuard rol="vendedor">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    // Empty render — guard waits for the store to settle.
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});

describe("<RoleGuard rol='admin'>", () => {
  it("(6) admin role: renders children", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "admin" }));

    render(
      <RoleGuard rol="admin">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("(7) vendedor role: blocked (vendedores do NOT pass admin guards)", () => {
    useAuthStore.getState().setFromUsuariosRol(makeVendedor({ rol: "vendedor" }));

    render(
      <RoleGuard rol="admin">
        <div data-testid="child">CONTENT</div>
      </RoleGuard>,
    );

    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Acceso restringido",
      expect.objectContaining({ description: expect.any(String) }),
    );
  });
});
