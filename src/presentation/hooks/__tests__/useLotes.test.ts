import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { useLotes } from "@/presentation/hooks/useLotes";

// ── Mock lotesRepository ──────────────────────────────────────────
const listarMock = vi.fn();
vi.mock("@/data/repositories", () => ({
  lotesRepository: {
    listar: (...args: unknown[]) => listarMock(...args),
  },
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

    // The current useLotes.ts does NOT catch errors; the hook surfaces the
    // error to the caller. The spec promise "returns empty array on Supabase
    // error" lands in PR-3 hardening.
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
