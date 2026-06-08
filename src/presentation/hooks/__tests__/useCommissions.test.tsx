import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockListarPorVendedor = vi.fn();
const mockListarReglas = vi.fn();

vi.mock("@/data/repositories", () => ({
  commissionsRepository: {
    listarPorVendedor: (...args: unknown[]) => mockListarPorVendedor(...args),
    crear: vi.fn(),
    cambiarEstado: vi.fn(),
    listarReglas: (...args: unknown[]) => mockListarReglas(...args),
  },
}));

import { useCommissions, useCommissionRules } from "@/presentation/hooks/useCommissions";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const mockCommissions = [
  {
    id: "c1",
    vendedorId: "v1",
    propertyId: "p1",
    salePrice: 400000,
    commissionAmount: 8000,
    status: "pending",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "c2",
    vendedorId: "v1",
    propertyId: "p2",
    salePrice: 600000,
    commissionAmount: 15000,
    status: "approved",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

const mockRules = [
  {
    id: "r1",
    minPrice: 0,
    maxPrice: 500000,
    percentage: 2.0,
    description: "Base",
    active: true,
  },
  {
    id: "r2",
    minPrice: 500001,
    maxPrice: null,
    percentage: 2.5,
    description: "Premium",
    active: true,
  },
];

describe("useCommissions (PR-4) — hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches commissions for a vendedor", async () => {
    mockListarPorVendedor.mockResolvedValue(mockCommissions);

    const { result } = renderHook(() => useCommissions("v1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.commissionAmount).toBe(8000);
  });

  it("is disabled when vendedorId is not provided", () => {
    const { result } = renderHook(() => useCommissions(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockListarPorVendedor).not.toHaveBeenCalled();
  });
});

describe("useCommissionRules (PR-4) — hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches commission rules", async () => {
    mockListarReglas.mockResolvedValue(mockRules);

    const { result } = renderHook(() => useCommissionRules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.percentage).toBe(2.0);
  });
});
