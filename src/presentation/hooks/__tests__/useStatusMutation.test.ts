import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useStatusMutation } from "@/presentation/hooks/useStatusMutation";

// ── Mock supabase (writes to legacy 'propiedades' table) ──────────
const fromMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();
const selectMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

// ── Mock sonner toast ────────────────────────────────────────────
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// ── Mock rethrowIfPresent (passthrough that throws) ──────────────
vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: (error: unknown) => {
    if (error) throw error;
  },
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  fromMock.mockReset();
  updateMock.mockReset();
  eqMock.mockReset();
  selectMock.mockReset();
  singleMock.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();

  // Default: successful update returning a row
  singleMock.mockResolvedValue({ data: { id: "prop-1", estado: "vendido" }, error: null });
  selectMock.mockReturnValue({ single: singleMock });
  eqMock.mockReturnValue({ select: selectMock });
  updateMock.mockReturnValue({ eq: eqMock });
  fromMock.mockReturnValue({ update: updateMock });
});

describe("useStatusMutation — retro tests (T-1.4, PR-1 baseline; deprecated in T-1.5)", () => {
  it("(1) on mutate, writes to the legacy 'propiedades' table via supabase.from('propiedades')", async () => {
    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ propiedadId: "prop-1", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fromMock).toHaveBeenCalledWith("propiedades");
    expect(updateMock).toHaveBeenCalledWith({ estado: "vendido" });
    expect(eqMock).toHaveBeenCalledWith("id", "prop-1");
  });

  it("(2) error path: marks isError and triggers toast.error", async () => {
    const errorObj = { message: "Row not found", code: "PGRST116" };
    singleMock.mockResolvedValue({ data: null, error: errorObj });

    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ propiedadId: "missing", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastError).toHaveBeenCalled();
  });

  it("(3) forwards cci to the update payload when provided", async () => {
    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ propiedadId: "prop-1", estado: "vendido", cci: "002-123456" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateMock).toHaveBeenCalledWith({ estado: "vendido", cci: "002-123456" });
  });

  it("(4) forwards metodoPago to the update payload as 'metodo_pago' (snake_case) when provided", async () => {
    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({
        propiedadId: "prop-1",
        estado: "vendido",
        metodoPago: "transferencia",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateMock).toHaveBeenCalledWith({
      estado: "vendido",
      metodo_pago: "transferencia",
    });
  });

  it("(5) forwards both cci and metodoPago when both are provided", async () => {
    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({
        propiedadId: "prop-1",
        estado: "vendido",
        cci: "002-999",
        metodoPago: "yape",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateMock).toHaveBeenCalledWith({
      estado: "vendido",
      cci: "002-999",
      metodo_pago: "yape",
    });
  });

  it("(6) on success: calls toast.success and invalidates ['propiedades'] and ['metricas'] cache keys", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useStatusMutation(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ propiedadId: "prop-1", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastSuccess).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["propiedades"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["metricas"] });
  });

  it("(7) on error: forwards the error message to toast.error as a description", async () => {
    const errorObj = { message: "RLS policy violation" };
    singleMock.mockResolvedValue({ data: null, error: errorObj });

    const { result } = renderHook(() => useStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ propiedadId: "prop-1", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastError).toHaveBeenCalledWith(
      "Error al actualizar",
      expect.objectContaining({ description: expect.stringContaining("RLS") }),
    );
  });
});
