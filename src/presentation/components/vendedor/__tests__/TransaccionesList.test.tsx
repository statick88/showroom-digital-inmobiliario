import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Tests for `<TransaccionesList>` (T-4.5, T-4.6, T-4.7).
 *
 * Covers:
 *   - Skeleton while loading
 *   - Empty state when no rows
 *   - Renders rows with Spanish-formatted date and PEN/USD currency
 *   - 50-per-page pagination (next/prev)
 *   - T-4.6: client-side tipo filter (reserva | venta | todos)
 *   - T-4.6: filtered-empty when filter has no matches
 *   - T-4.6: aria-pressed reflects the active filter
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

describe("<TransaccionesList> (T-4.5) — base list", () => {
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

describe("<TransaccionesList> (T-4.6) — filter logic", () => {
  it("(T-4.6.1) clicking the 'reserva' filter shows only reserva rows and updates the count", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [
        makeRow({ id: "t-r1", tipo: "reserva" }),
        makeRow({ id: "t-v1", tipo: "venta" }),
        makeRow({ id: "t-r2", tipo: "reserva" }),
        makeRow({ id: "t-v2", tipo: "venta" }),
      ],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });

    // Sanity: all 4 rows visible by default
    expect(screen.getAllByTestId("transaccion-row")).toHaveLength(4);

    // Click the "reserva" filter
    fireEvent.click(screen.getByTestId("filtro-tipo-reserva"));

    // Now only the 2 reserva rows are visible
    const rows = screen.getAllByTestId("transaccion-row");
    expect(rows).toHaveLength(2);
    rows.forEach((r) => {
      expect(r.textContent).toMatch(/reserva/);
    });

    // The filter count is shown
    expect(screen.getByTestId("filtro-conteo")).toHaveTextContent("2 resultados");
  });

  it("(T-4.6.2) clicking the 'venta' filter shows only venta rows", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [
        makeRow({ id: "t-r1", tipo: "reserva" }),
        makeRow({ id: "t-v1", tipo: "venta" }),
        makeRow({ id: "t-v2", tipo: "venta" }),
      ],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByTestId("filtro-tipo-venta"));

    const rows = screen.getAllByTestId("transaccion-row");
    expect(rows).toHaveLength(2);
    rows.forEach((r) => expect(r.textContent).toMatch(/venta/));
  });

  it("(T-4.6.3) when the filter has no matches, the table shows the 'filtered-empty' message and no rows", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [makeRow({ tipo: "reserva" })],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByTestId("filtro-tipo-venta"));

    expect(screen.queryAllByTestId("transaccion-row")).toHaveLength(0);
    expect(screen.getByTestId("transacciones-filtered-empty")).toBeInTheDocument();
  });

  it("(T-4.6.4) clicking 'todos' restores the full list", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [makeRow({ tipo: "reserva" }), makeRow({ tipo: "venta" })],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });

    fireEvent.click(screen.getByTestId("filtro-tipo-reserva"));
    expect(screen.getAllByTestId("transaccion-row")).toHaveLength(1);

    fireEvent.click(screen.getByTestId("filtro-tipo-todos"));
    expect(screen.getAllByTestId("transaccion-row")).toHaveLength(2);
  });

  it("(T-4.6.5) the active filter button is visually distinguished via aria-pressed=true", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [makeRow()],
      isLoading: false,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    const todos = screen.getByTestId("filtro-tipo-todos");
    const reserva = screen.getByTestId("filtro-tipo-reserva");
    expect(todos.getAttribute("aria-pressed")).toBe("true");
    expect(reserva.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(reserva);
    expect(reserva.getAttribute("aria-pressed")).toBe("true");
    expect(todos.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("<TransaccionesList> (T-4.7) — empty + skeleton state polish", () => {
  it("(T-4.7.1) skeleton shows 5 pulsing rows and an aria-label", () => {
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TransaccionesList vendedorId="v-1" />, { wrapper: makeWrapper() });
    const skeleton = screen.getByTestId("transacciones-skeleton");
    expect(skeleton.getAttribute("aria-label")).toBe("Cargando transacciones");
    expect(screen.getAllByTestId("skeleton-row")).toHaveLength(5);
  });

  it("(T-4.7.2) empty state distinguishes between 'no auth' and 'no data yet'", () => {
    // No data, no auth
    useTransaccionesPorVendedorMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    const wrapper = makeWrapper();
    const { rerender } = render(<TransaccionesList vendedorId={null} />, {
      wrapper,
    });
    expect(screen.getByText(/inicia sesion/i)).toBeInTheDocument();
    rerender(<TransaccionesList vendedorId="v-1" />);
    expect(screen.getByText(/aun no tiene transacciones/i)).toBeInTheDocument();
  });
});
