import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

/**
 * Tests for `useTransacciones` (T-4.5 family, exposed hooks):
 *   - `useTransacciones(loteId?)`
 *   - `useTransaccionesPorVendedor(vendedorId)`
 *   - `useCrearTransaccion()`
 *   - `useMetricas()`
 *
 * Strategy: mock the repository and `env.proyectoId` so the hooks can
 * be exercised without touching Supabase. Cache invalidation on
 * `onSuccess` is observed via the QueryClient.
 */

import type { Transaccion, DashboardMetricas, CrearTransaccionData } from "@/domain/entities/lote";

// ── Mock env so `useMetricas` resolves `proyectoId` ─────────────────
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

// ── Mock the repository ─────────────────────────────────────────────
const listarMock = vi.fn();
const listarPorVendedorMock = vi.fn();
const crearMock = vi.fn();
const obtenerMetricasMock = vi.fn();
const exportarCSVMock = vi.fn();

vi.mock("@/data/repositories/supabase-transacciones.repository.impl", () => ({
  transaccionesRepository: {
    listar: (...args: unknown[]) => listarMock(...args),
    listarPorVendedor: (...args: unknown[]) => listarPorVendedorMock(...args),
    crear: (...args: unknown[]) => crearMock(...args),
    obtenerMetricas: (...args: unknown[]) => obtenerMetricasMock(...args),
    exportarCSV: (...args: unknown[]) => exportarCSVMock(...args),
  },
}));

import {
  useTransacciones,
  useTransaccionesPorVendedor,
  useCrearTransaccion,
  useMetricas,
  TRANSACCIONES_POR_VENDEDOR_QUERY_KEY,
} from "@/presentation/hooks/useTransacciones";

function makeTransaccion(overrides: Partial<Transaccion> = {}): Transaccion {
  return {
    id: "t-1",
    loteId: "l-1",
    tipo: "reserva",
    compradorNombre: "Juan Pérez",
    compradorDocumento: "12345678",
    compradorEmail: "juan@example.com",
    compradorTelefono: "+51999000999",
    monto: 50000,
    moneda: "PEN",
    idVendedor: "v-1",
    notas: "Reserva de prueba",
    createdAt: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

function makeMetricas(overrides: Partial<DashboardMetricas> = {}): DashboardMetricas {
  return {
    totalLotes: 100,
    disponibles: 60,
    reservados: 25,
    vendidos: 15,
    totalTransacciones: 42,
    avancePorcentaje: 35,
    totalVentasPen: 1_500_000,
    totalVentasUsd: 0,
    ...overrides,
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return {
    queryClient,
    Wrapper: ({ children }: { children: ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

beforeEach(() => {
  listarMock.mockReset();
  listarPorVendedorMock.mockReset();
  crearMock.mockReset();
  obtenerMetricasMock.mockReset();
  exportarCSVMock.mockReset();
});

describe("useTransacciones (read) — T-4.5 family", () => {
  it("(1) calls transaccionesRepository.listar with the loteId when provided", async () => {
    const rows = [makeTransaccion({ id: "t-a" }), makeTransaccion({ id: "t-b" })];
    listarMock.mockResolvedValue(rows);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useTransacciones("lote-1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarMock).toHaveBeenCalledWith("lote-1");
    expect(result.current.data).toEqual(rows);
  });

  it("(2) calls transaccionesRepository.listar with undefined when loteId is omitted", async () => {
    listarMock.mockResolvedValue([]);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useTransacciones(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarMock).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual([]);
  });

  it("(3) returns the rejected error from the repository", async () => {
    const err = new Error("network down");
    listarMock.mockRejectedValue(err);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useTransacciones("lote-err"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(err);
  });
});

describe("useTransaccionesPorVendedor (read) — T-4.5", () => {
  it("(4) when vendedorId is null, the query is disabled and the repo is never called", async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useTransaccionesPorVendedor(null), { wrapper: Wrapper });

    // With `enabled: false`, the query stays in `pending` state and
    // never fires. We assert the negative: the repo is not called.
    await new Promise((r) => setTimeout(r, 50));
    expect(listarPorVendedorMock).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
    // The query status stays pending and `data` is undefined because
    // `queryFn` is short-circuited by `enabled: false`.
    expect(result.current.data).toBeUndefined();
  });

  it("(5) calls transaccionesRepository.listarPorVendedor(vendedorId) when provided", async () => {
    const rows = [makeTransaccion({ idVendedor: "v-1" })];
    listarPorVendedorMock.mockResolvedValue(rows);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useTransaccionesPorVendedor("v-1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(listarPorVendedorMock).toHaveBeenCalledWith("v-1");
    expect(result.current.data).toEqual(rows);
  });

  it("(6) exposes TRANSACCIONES_POR_VENDEDOR_QUERY_KEY as a stable string", () => {
    expect(TRANSACCIONES_POR_VENDEDOR_QUERY_KEY).toBe("transacciones-por-vendedor");
  });
});

describe("useCrearTransaccion (mutation) — invalidates ['transacciones', vendedor-lists, 'lotes']", () => {
  it("(7) calls transaccionesRepository.crear with the form data", async () => {
    const created = makeTransaccion({ id: "t-new" });
    crearMock.mockResolvedValue(created);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Wrapper });

    const payload: CrearTransaccionData = {
      loteId: "l-1",
      tipo: "reserva",
      compradorNombre: "Ada Lovelace",
      compradorDocumento: "12345678",
      compradorEmail: "ada@x.com",
      compradorTelefono: "+51999000111",
      monto: 75000,
      moneda: "PEN",
      idVendedor: "v-1",
      notas: "nueva",
    };

    let returned: Transaccion | undefined;
    await act(async () => {
      returned = await result.current.mutateAsync(payload);
    });

    expect(crearMock).toHaveBeenCalledWith(payload);
    expect(returned).toEqual(created);
    // `useMutation.data` should reflect the resolved value.
    await waitFor(() => expect(result.current.data).toEqual(created));
    expect(result.current.isSuccess).toBe(true);
  });

  it("(8) on success, invalidates transacciones + vendedor + lotes query prefixes", async () => {
    crearMock.mockResolvedValue(makeTransaccion());

    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        loteId: "l-1",
        tipo: "venta",
        compradorNombre: "X",
        monto: 1,
        moneda: "PEN",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // The hook must invalidate these three prefixes so dependent
    // views refetch in one place.
    const invalidatedKeys = invalidateSpy.mock.calls.map((c) => c[0]);
    expect(invalidatedKeys).toContainEqual({ queryKey: ["transacciones"] });
    expect(invalidatedKeys).toContainEqual({
      queryKey: [TRANSACCIONES_POR_VENDEDOR_QUERY_KEY],
    });
    expect(invalidatedKeys).toContainEqual({ queryKey: ["lotes"] });
  });

  it("(9) surfaces the error when the repository rejects", async () => {
    const err = new Error("constraint violation");
    crearMock.mockRejectedValue(err);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useCrearTransaccion(), { wrapper: Wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          loteId: "l-1",
          tipo: "reserva",
          compradorNombre: "X",
          monto: 1,
          moneda: "PEN",
        }),
      ).rejects.toBe(err);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(err);
  });
});

describe("useMetricas (read) — uses env.proyectoId", () => {
  it("(10) calls transaccionesRepository.obtenerMetricas with the env proyectoId", async () => {
    const m = makeMetricas();
    obtenerMetricasMock.mockResolvedValue(m);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMetricas(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(obtenerMetricasMock).toHaveBeenCalledWith("mock-proyecto-id");
    expect(result.current.data).toEqual(m);
  });

  it("(11) the queryKey includes the proyectoId so different projects cache separately", async () => {
    obtenerMetricasMock.mockResolvedValue(makeMetricas());

    const { Wrapper, queryClient } = makeWrapper();
    const { result } = renderHook(() => useMetricas(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Sanity: the cache should contain at least one entry whose key
    // includes the mocked proyectoId.
    const allQueries = queryClient.getQueryCache().getAll();
    const metricaEntries = allQueries.filter(
      (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "metricas",
    );
    expect(metricaEntries.length).toBeGreaterThan(0);
    expect(metricaEntries[0]!.queryKey).toEqual(["metricas", "mock-proyecto-id"]);
  });
});
