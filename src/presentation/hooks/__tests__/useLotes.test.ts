import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import {
  useLotes,
  useLote,
  useCrearLote,
  useActualizarLote,
  useCambiarEstadoLote,
  useEliminarLote,
} from "@/presentation/hooks/useLotes";

// ── Mock lotesRepository ──────────────────────────────────────────
const listarMock = vi.fn();
const obtenerPorIdMock = vi.fn();
const crearMock = vi.fn();
const actualizarMock = vi.fn();
const cambiarEstadoMock = vi.fn();
const eliminarMock = vi.fn();

vi.mock("@/data/repositories", () => ({
  lotesRepository: {
    listar: (...args: unknown[]) => listarMock(...args),
    obtenerPorId: (...args: unknown[]) => obtenerPorIdMock(...args),
    crear: (...args: unknown[]) => crearMock(...args),
    actualizar: (...args: unknown[]) => actualizarMock(...args),
    cambiarEstado: (...args: unknown[]) => cambiarEstadoMock(...args),
    eliminar: (...args: unknown[]) => eliminarMock(...args),
  },
}));

// T-4.3 added `import { env } from "@/config/env"` to useLotes.ts (for
// useLotesPorVendedor). Mock it here so this test does not need a
// real VITE_PROYECTO_ID.
vi.mock("@/config/env", () => ({
  env: { proyectoId: "env-proj-1" },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  listarMock.mockReset();
  obtenerPorIdMock.mockReset();
  crearMock.mockReset();
  actualizarMock.mockReset();
  cambiarEstadoMock.mockReset();
  eliminarMock.mockReset();
});

describe("useLotes — retro tests (T-1.4, PR-1 foundations baseline)", () => {
  it("(1) fetches lotes on mount via lotesRepository.listar(proyectoId)", async () => {
    listarMock.mockResolvedValue([{ id: "l1", codigo: "LT-001", estado: "disponible" }]);

    const { result } = renderHook(() => useLotes("proy-1"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listarMock).toHaveBeenCalledWith("proy-1", undefined);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.codigo).toBe("LT-001");
  });

  it("(1b) forwards filtros to lotesRepository.listar", async () => {
    listarMock.mockResolvedValue([]);

    const { result } = renderHook(
      () => useLotes("proy-1", { estado: "disponible", search: "LT" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listarMock).toHaveBeenCalledWith("proy-1", { estado: "disponible", search: "LT" });
  });

  it("(3) surfaces errors to the caller when lotesRepository.listar rejects", async () => {
    listarMock.mockRejectedValue(new Error("Supabase down"));

    const { result } = renderHook(() => useLotes("proy-1"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useLote — single-lote fetch by id", () => {
  it("(4) when id is provided, calls lotesRepository.obtenerPorId(id) and returns the lote", async () => {
    obtenerPorIdMock.mockResolvedValue({ id: "lote-1", codigo: "LT-001", estado: "disponible" });

    const { result } = renderHook(() => useLote("lote-1"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(obtenerPorIdMock).toHaveBeenCalledWith("lote-1");
    expect(result.current.data?.id).toBe("lote-1");
  });

  it("(5) when id is undefined, the query is disabled (does not call the repository)", async () => {
    const { result } = renderHook(() => useLote(undefined), { wrapper: makeWrapper() });

    // Wait a tick for any pending fetches
    await new Promise((r) => setTimeout(r, 50));

    expect(obtenerPorIdMock).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("(6) surfaces errors from the repository (obtenerPorId rejected)", async () => {
    obtenerPorIdMock.mockRejectedValue(new Error("RLS blocked"));

    const { result } = renderHook(() => useLote("lote-1"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("RLS blocked");
  });
});

describe("useCrearLote — mutation with cache invalidation", () => {
  it("(7) mutate(data) calls lotesRepository.crear(data) and on success invalidates ['lotes']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    crearMock.mockResolvedValue({ id: "lote-new", codigo: "LT-NEW" });

    const { result } = renderHook(() => useCrearLote(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({
        proyectoId: "proy-1",
        codigo: "LT-NEW",
        areaTotal: 200,
        precio: 100000,
        moneda: "PEN",
        poligonoCoords: [[[0, 0]]],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(crearMock).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: "LT-NEW", proyectoId: "proy-1" }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["lotes"] });
  });
});

describe("useActualizarLote — mutation with cache invalidation", () => {
  it("(8) mutate({id, data}) calls lotesRepository.actualizar(id, data) and invalidates ['lotes']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    actualizarMock.mockResolvedValue({ id: "lote-1", estado: "vendido" });

    const { result } = renderHook(() => useActualizarLote(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "lote-1", data: { estado: "vendido", precio: 999 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(actualizarMock).toHaveBeenCalledWith("lote-1", { estado: "vendido", precio: 999 });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["lotes"] });
  });
});

describe("useCambiarEstadoLote — mutation with cache invalidation", () => {
  it("(9) mutate({id, estado}) calls lotesRepository.cambiarEstado(id, estado) and invalidates ['lotes']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    cambiarEstadoMock.mockResolvedValue({ id: "lote-1", estado: "reservado" });

    const { result } = renderHook(() => useCambiarEstadoLote(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "lote-1", estado: "reservado" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiarEstadoMock).toHaveBeenCalledWith("lote-1", "reservado");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["lotes"] });
  });
});

describe("useEliminarLote — mutation with cache invalidation", () => {
  it("(10) mutate(id) calls lotesRepository.eliminar(id) and on success invalidates ['lotes']", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    eliminarMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEliminarLote(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate("lote-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(eliminarMock).toHaveBeenCalledWith("lote-1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["lotes"] });
  });
});
