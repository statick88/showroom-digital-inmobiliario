import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockGetByVisitor = vi.fn();
const mockCompute = vi.fn();

vi.mock("@/data/repositories", () => ({
  leadScoresRepository: {
    getByVisitor: (...args: unknown[]) => mockGetByVisitor(...args),
    compute: (...args: unknown[]) => mockCompute(...args),
  },
}));

import { useLeadScoring } from "@/presentation/hooks/useLeadScoring";
import { leadScoresRepository } from "@/data/repositories";

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useLeadScoring (PR-3) — hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state initially when visitorId is provided", () => {
    mockGetByVisitor.mockResolvedValue(null);

    const { result } = renderHook(() => useLeadScoring("visitor-123"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("fetches lead score when visitorId is provided", async () => {
    const mockScore = {
      id: "score-1",
      visitorId: "visitor-123",
      score: 75,
      breakdown: { views: 3, clicks: 2, time: 60, repeats: 1 },
      computedAt: "2026-01-01T00:00:00Z",
    };
    mockGetByVisitor.mockResolvedValue(mockScore);

    const { result } = renderHook(() => useLeadScoring("visitor-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockScore);
    expect(mockGetByVisitor).toHaveBeenCalledWith("visitor-123");
  });

  it("does not fetch when visitorId is undefined", () => {
    const { result } = renderHook(() => useLeadScoring(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGetByVisitor).not.toHaveBeenCalled();
  });

  it("returns null data when no score exists for visitor", async () => {
    mockGetByVisitor.mockResolvedValue(null);

    const { result } = renderHook(() => useLeadScoring("visitor-new"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it("exposes computeScore function for triggering recomputation", async () => {
    const mockScore = {
      id: "score-2",
      visitorId: "visitor-456",
      score: 50,
      breakdown: { views: 2, clicks: 1, time: 30, repeats: 0 },
      computedAt: "2026-01-01T00:00:00Z",
    };
    mockCompute.mockResolvedValue(mockScore);
    mockGetByVisitor.mockResolvedValue(null);

    const { result } = renderHook(() => useLeadScoring("visitor-456"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    await result.current.computeScore();

    expect(mockCompute).toHaveBeenCalledWith("visitor-456");
  });
});
