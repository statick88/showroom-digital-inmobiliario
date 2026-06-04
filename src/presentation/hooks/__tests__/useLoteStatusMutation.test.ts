import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useLoteStatusMutation } from "@/presentation/hooks/useLoteStatusMutation";
import type { EstadoLote } from "@/domain/entities/lote";

// ── Mock lotesRepository ──────────────────────────────────────────
const cambiarEstadoMock = vi.fn();
vi.mock("@/data/repositories", () => ({
  lotesRepository: {
    cambiarEstado: (...args: unknown[]) => cambiarEstadoMock(...args),
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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  cambiarEstadoMock.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
  cambiarEstadoMock.mockResolvedValue({
    id: "lote-1",
    proyectoId: "proy-1",
    codigo: "LT-001",
    estado: "vendido" as EstadoLote,
  });
});

describe("useLoteStatusMutation — T-1.5: NEW hook, writes to 'lotes' table via repository", () => {
  it("(1) on mutate({loteId, estado}), delegates to lotesRepository.cambiarEstado(loteId, estado)", async () => {
    const { result } = renderHook(() => useLoteStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ loteId: "lote-1", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(cambiarEstadoMock).toHaveBeenCalledWith("lote-1", "vendido");
  });

  it("(2) returns the updated lote on success", async () => {
    const { result } = renderHook(() => useLoteStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ loteId: "lote-1", estado: "reservado" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("lote-1");
    expect(result.current.data?.estado).toBe("vendido");
  });

  it("(3) on error, surfaces isError=true and triggers toast.error", async () => {
    cambiarEstadoMock.mockRejectedValue(new Error("RLS blocked"));

    const { result } = renderHook(() => useLoteStatusMutation(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ loteId: "lote-1", estado: "vendido" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toastError).toHaveBeenCalled();
  });

  it("(4) on success, calls toast.success and invalidates the ['lotes'] query key", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Wrapper({ children }: { children: ReactNode }) {
      return React.createElement(QueryClientProvider, { client: queryClient }, children);
    }

    const { result } = renderHook(() => useLoteStatusMutation(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ loteId: "lote-1", estado: "disponible" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastSuccess).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ["lotes"] }));
  });
});
