import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Tests for the TanStack Query wrappers in `useUsuarios`.
 *
 * T-4.1 (PR-4). The hooks are thin — they delegate to
 * `usuariosRepository` and invalidate the right query keys. We mock
 * the repository so the tests don't need Supabase.
 */

import {
  useUsuarios,
  useVendedorByAuthUser,
  useCrearVendedor,
  useActualizarVendedor,
  useDesactivarVendedor,
} from "@/presentation/hooks/useUsuarios";
import { usuariosRepository } from "@/data/repositories";
import type { VendedorProfile } from "@/domain/entities/vendedor";

// ── Mock the repository ────────────────────────────────────────────
const listarMock = vi.fn();
const getByIdMock = vi.fn();
const getByAuthUserIdMock = vi.fn();
const crearMock = vi.fn();
const actualizarMock = vi.fn();
const desactivarMock = vi.fn();

vi.mock("@/data/repositories", () => ({
  usuariosRepository: {
    listar: (...args: unknown[]) => listarMock(...args),
    getById: (...args: unknown[]) => getByIdMock(...args),
    getByAuthUserId: (...args: unknown[]) => getByAuthUserIdMock(...args),
    crear: (...args: unknown[]) => crearMock(...args),
    actualizar: (...args: unknown[]) => actualizarMock(...args),
    desactivar: (...args: unknown[]) => desactivarMock(...args),
  },
}));

const makeVendedor = (overrides: Partial<VendedorProfile> = {}): VendedorProfile => ({
  id: "user-1",
  authUserId: "auth-1",
  email: "vendedor@inmobiliaria.pe",
  nombre: "María García",
  rol: "vendedor",
  telefono: "+51999000111",
  activo: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  listarMock.mockReset();
  getByIdMock.mockReset();
  getByAuthUserIdMock.mockReset();
  crearMock.mockReset();
  actualizarMock.mockReset();
  desactivarMock.mockReset();
  listarMock.mockResolvedValue([makeVendedor()]);
  getByIdMock.mockResolvedValue(makeVendedor());
  getByAuthUserIdMock.mockResolvedValue(makeVendedor());
  crearMock.mockResolvedValue(makeVendedor({ id: "user-new" }));
  actualizarMock.mockResolvedValue(makeVendedor({ nombre: "Updated" }));
  desactivarMock.mockResolvedValue(makeVendedor({ activo: false }));
});

describe("useUsuarios (T-4.1) — read hooks", () => {
  it("(1) useUsuarios: delegates to usuariosRepository.listar() and returns the rows", async () => {
    const { result } = renderHook(() => useUsuarios(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarMock).toHaveBeenCalled();
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.email).toBe("vendedor@inmobiliaria.pe");
  });

  it("(2) useVendedorByAuthUser: queries by authUserId and returns the row", async () => {
    const { result } = renderHook(() => useVendedorByAuthUser("auth-77"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getByAuthUserIdMock).toHaveBeenCalledWith("auth-77");
    expect(result.current.data?.authUserId).toBe("auth-1");
  });

  it("(3) useVendedorByAuthUser: does NOT fetch when authUserId is undefined (enabled=false)", async () => {
    const { result } = renderHook(() => useVendedorByAuthUser(undefined), {
      wrapper: makeWrapper(),
    });
    // isPending stays true and isSuccess stays false when disabled
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(getByAuthUserIdMock).not.toHaveBeenCalled();
  });
});

describe("useUsuarios (T-4.1) — write hooks (mutations)", () => {
  it("(4) useCrearVendedor: delegates to usuariosRepository.crear(data)", async () => {
    const { result } = renderHook(() => useCrearVendedor(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        email: "nuevo@x.com",
        password: "temporal123",
        nombre: "Nuevo",
        dni: "12345678",
        rol: "vendedor",
      });
    });
    expect(crearMock).toHaveBeenCalledWith({
      email: "nuevo@x.com",
      password: "temporal123",
      nombre: "Nuevo",
      dni: "12345678",
      rol: "vendedor",
    });
  });

  it("(5) useCrearVendedor: on success, invalidates the ['usuarios'] query key so the list refetches", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useCrearVendedor(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        email: "x@x.com",
        password: "12345678",
        nombre: "X",
        dni: "87654321",
        rol: "vendedor",
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usuarios"] });
  });

  it("(6) useActualizarVendedor: delegates and invalidates ['usuarios']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useActualizarVendedor(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: "user-1", data: { telefono: "+51" } });
    });

    expect(actualizarMock).toHaveBeenCalledWith("user-1", { telefono: "+51" });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usuarios"] });
  });

  it("(7) useDesactivarVendedor: delegates to usuariosRepository.desactivar and invalidates ['usuarios']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useDesactivarVendedor(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("user-1");
    });

    expect(desactivarMock).toHaveBeenCalledWith("user-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["usuarios"] });
  });
});
