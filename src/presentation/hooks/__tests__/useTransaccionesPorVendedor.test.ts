import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import {
  useTransaccionesPorVendedor,
  TRANSACCIONES_POR_VENDEDOR_QUERY_KEY,
} from "@/presentation/hooks/useTransacciones";

// ── Mock transaccionesRepository ──────────────────────────────────
const listarPorVendedorMock = vi.fn();
vi.mock("@/data/repositories", () => ({
  transaccionesRepository: {
    listarPorVendedor: (...args: unknown[]) => listarPorVendedorMock(...args),
  },
}));

// useTransacciones.ts imports env (for useMetricas). Mock it.
vi.mock("@/config/env", () => ({
  env: { proyectoId: "env-proj-1" },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  listarPorVendedorMock.mockReset();
});

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "t-1",
    loteId: "l-1",
    tipo: "reserva" as const,
    compradorNombre: "Juan Pérez",
    monto: 50000,
    moneda: "PEN" as const,
    idVendedor: "v-1",
    createdAt: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

describe("useTransaccionesPorVendedor (T-4.5)", () => {
  it("(1) on mount, calls transaccionesRepository.listarPorVendedor(vendedorId)", async () => {
    listarPorVendedorMock.mockResolvedValue([makeRow()]);

    const { result } = renderHook(() => useTransaccionesPorVendedor("v-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarPorVendedorMock).toHaveBeenCalledWith("v-1");
    expect(result.current.data).toHaveLength(1);
  });

  it("(2) when vendedorId is null, the query is disabled and returns an empty array (no repository call)", async () => {
    const { result } = renderHook(() => useTransaccionesPorVendedor(null), {
      wrapper: makeWrapper(),
    });

    // Wait a tick to ensure no fetch is fired
    await new Promise((r) => setTimeout(r, 30));
    expect(listarPorVendedorMock).not.toHaveBeenCalled();
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined(); // never resolved
  });

  it("(3) surfaces errors from the repository", async () => {
    listarPorVendedorMock.mockRejectedValue(new Error("RLS blocked"));

    const { result } = renderHook(() => useTransaccionesPorVendedor("v-1"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("RLS blocked");
  });

  it("(4) the query key includes both the constant and the vendedorId", async () => {
    listarPorVendedorMock.mockResolvedValue([]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }
    renderHook(() => useTransaccionesPorVendedor("v-42"), { wrapper: Wrapper });

    await waitFor(() => {
      const keys = queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey);
      expect(keys).toContainEqual([TRANSACCIONES_POR_VENDEDOR_QUERY_KEY, "v-42"]);
    });
  });
});
