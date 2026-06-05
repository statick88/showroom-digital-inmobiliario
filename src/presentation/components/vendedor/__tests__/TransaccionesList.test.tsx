import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Tests for `<TransaccionesList>` (T-4.5).
 *
 * Covers:
 *   - Skeleton while loading
 *   - Empty state when no rows
 *   - Renders rows with Spanish-formatted date and PEN/USD currency
 *   - 50-per-page pagination (next/prev)
 *
 * The component uses `useTransaccionesPorVendedor`, which is mocked
 * via `@/presentation/hooks/useTransacciones`. We do NOT mock the
 * repository directly — instead we drive the hook mock to return
 * the desired shape.
 */

import { TransaccionesList } from "@/presentation/components/vendedor/TransaccionesList";

// ── Mocks ──────────────────────────────────────────────────────────
const useTransaccionesPorVendedorMock = vi.fn();
vi.mock("@/presentation/hooks/useTransacciones", () => ({
  useTransaccionesPorVendedor: (...args: unknown[]) => useTransaccionesPorVendedorMock(...args),
}));

vi.mock("@/config/env", () => ({
  env: { proyectoId: "proj-1" },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "t-1",
    loteId: "l-1",
    tipo: "reserva" as const,
    compradorNombre: "Juan Pérez",
    compradorDocumento: "12345678",
    compradorEmail: "juan@example.com",
    compradorTelefono: "+51999000999",
    monto: 50000,
    moneda: "PEN" as const,
    idVendedor: "v-1",
    notas: null,
    createdAt: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  useTransaccionesPorVendedorMock.mockReset();
});

describe("<TransaccionesList> (T-4.5)", () => {
  it("(1) shows a skeleton while loading", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    expect(screen.getByTestId("transacciones-skeleton")).toBeInTheDocument();
  });

  it("(2) shows an empty state when there are no rows", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    expect(screen.getByTestId("transacciones-empty")).toBeInTheDocument();
    expect(screen.getByText(/no tiene transacciones/i)).toBeInTheDocument();
  });

  it("(3) renders a row per transaction with Spanish-formatted date and PEN currency", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [makeRow()],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });

    // 15/01/2026 in dd/mm/yyyy
    expect(screen.getByText("15/01/2026")).toBeInTheDocument();
    // PEN formatted as "S/ 50,000"
    expect(screen.getByText(/S\/\s*50,000/)).toBeInTheDocument();
    // The buyer name appears
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("(4) formats USD amounts with $ and es-PE grouping", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [makeRow({ monto: 15000, moneda: "USD" })],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    expect(screen.getByText(/\$\s*15,000/)).toBeInTheDocument();
  });

  it("(5) when more than 50 rows are returned, only the first 50 are visible and a 'Siguiente' button appears", () => {
    const rows = Array.from({ length: 60 }, (_, i) =>
      makeRow({
        id: `t-${i + 1}`,
        createdAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
      }),
    );
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: rows,
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });

    // First page shows 50 rows
    const dataRows = screen.getAllByTestId("transaccion-row");
    expect(dataRows).toHaveLength(50);
    // Pagination control is present
    expect(screen.getByRole("button", { name: /Siguiente/i })).toBeInTheDocument();
  });

  it("(6) clicking 'Siguiente' reveals the remaining rows", () => {
    const rows = Array.from({ length: 60 }, (_, i) =>
      makeRow({
        id: `t-${i + 1}`,
        createdAt: `2026-01-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
      }),
    );
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: rows,
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));

    const dataRows = screen.getAllByTestId("transaccion-row");
    expect(dataRows).toHaveLength(10);
    // "Anterior" button is now visible
    expect(screen.getByRole("button", { name: /Anterior/i })).toBeInTheDocument();
  });
});
