import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { ReactNode } from "react";

import { usePOIs } from "@/presentation/hooks/usePOIs";

// ── Mock tourPOIsRepository ──────────────────────────────────────────
const listMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/data/repositories", () => ({
  tourPOIsRepository: {
    list: (...args: unknown[]) => listMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
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

function makePOIFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "poi-1",
    tour_id: "tour-1",
    name: "Club House",
    description: "Área común del proyecto",
    poi_type: "amenity" as const,
    icon: "🏢",
    lat: -12.05,
    lng: -77.03,
    metadata: {},
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  listMock.mockReset();
  createMock.mockReset();
  updateMock.mockReset();
  deleteMock.mockReset();
});

describe("usePOIs", () => {
  describe("list POIs on mount", () => {
    it("fetches POIs via tourPOIsRepository.list(tourId)", async () => {
      const fixture = makePOIFixture();
      listMock.mockResolvedValue([fixture]);

      const { result } = renderHook(() => usePOIs("tour-1"), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(listMock).toHaveBeenCalledWith("tour-1");
      expect(result.current.pois).toHaveLength(1);
      expect(result.current.pois?.[0]?.name).toBe("Club House");
    });

    it("returns empty array when no POIs exist", async () => {
      listMock.mockResolvedValue([]);

      const { result } = renderHook(() => usePOIs("tour-1"), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.pois).toHaveLength(0);
    });

    it("does not call repository when tourId is empty", async () => {
      const { result } = renderHook(() => usePOIs(""), {
        wrapper: makeWrapper(),
      });

      await new Promise((r) => setTimeout(r, 50));

      expect(listMock).not.toHaveBeenCalled();
      expect(result.current.pois).toHaveLength(0);
    });
  });

  describe("createPOI — mutation with cache invalidation", () => {
    it("calls tourPOIsRepository.create(data) and invalidates cache", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      function Wrapper({ children }: { children: ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      const createdPOI = makePOIFixture({ id: "poi-new", name: "Parque" });
      createMock.mockResolvedValue(createdPOI);

      const { result } = renderHook(() => usePOIs("tour-1"), { wrapper: Wrapper });

      await act(async () => {
        result.current.createPOI.mutate({
          tour_id: "tour-1",
          name: "Parque",
          poi_type: "amenity",
          lat: -12.06,
          lng: -77.04,
        });
      });

      await waitFor(() => expect(result.current.createPOI.isSuccess).toBe(true));

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Parque", tour_id: "tour-1" }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["tour-pois", "tour-1"],
      });
    });
  });

  describe("updatePOI — mutation with cache invalidation", () => {
    it("calls tourPOIsRepository.update(id, data) and invalidates cache", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      function Wrapper({ children }: { children: ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      const updatedPOI = makePOIFixture({ name: "Club House Renovado" });
      updateMock.mockResolvedValue(updatedPOI);

      const { result } = renderHook(() => usePOIs("tour-1"), { wrapper: Wrapper });

      await act(async () => {
        result.current.updatePOI.mutate({
          id: "poi-1",
          data: { name: "Club House Renovado" },
        });
      });

      await waitFor(() => expect(result.current.updatePOI.isSuccess).toBe(true));

      expect(updateMock).toHaveBeenCalledWith("poi-1", {
        name: "Club House Renovado",
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["tour-pois", "tour-1"],
      });
    });
  });

  describe("deletePOI — mutation with cache invalidation", () => {
    it("calls tourPOIsRepository.delete(id) and invalidates cache", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      function Wrapper({ children }: { children: ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      }

      deleteMock.mockResolvedValue(undefined);

      const { result } = renderHook(() => usePOIs("tour-1"), { wrapper: Wrapper });

      await act(async () => {
        result.current.deletePOI.mutate("poi-1");
      });

      await waitFor(() => expect(result.current.deletePOI.isSuccess).toBe(true));

      expect(deleteMock).toHaveBeenCalledWith("poi-1");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["tour-pois", "tour-1"],
      });
    });
  });

  describe("error handling", () => {
    it("surfaces errors when list fails", async () => {
      listMock.mockRejectedValue(new Error("Supabase down"));

      const { result } = renderHook(() => usePOIs("tour-1"), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
