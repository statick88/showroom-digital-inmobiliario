import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockListTopScores = vi.fn();

vi.mock("@/data/repositories", () => ({
  leadScoresRepository: {
    listTopScores: (...args: unknown[]) => mockListTopScores(...args),
  },
}));

import { LeadScoringPanel } from "../LeadScoringPanel";

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockScores = [
  {
    id: "s1",
    visitorId: "v-abc",
    score: 85,
    breakdown: { views: 5, clicks: 3, time: 120, repeats: 2 },
    computedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "s2",
    visitorId: "v-def",
    score: 42,
    breakdown: { views: 2, clicks: 1, time: 30, repeats: 0 },
    computedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "s3",
    visitorId: "v-ghi",
    score: 15,
    breakdown: { views: 1, clicks: 0, time: 10, repeats: 0 },
    computedAt: "2026-01-01T00:00:00Z",
  },
];

describe("LeadScoringPanel (PR-3) — panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockListTopScores.mockReturnValue(new Promise(() => {})); // never resolves

    render(<LeadScoringPanel />, { wrapper: createWrapper() });
    expect(screen.getByText("Cargando leads...")).toBeInTheDocument();
  });

  it("renders list of lead scores when data loads", async () => {
    mockListTopScores.mockResolvedValue(mockScores);

    render(<LeadScoringPanel />, { wrapper: createWrapper() });

    await screen.findByText("85");

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders 'Alto', 'Medio', 'Bajo' labels for different score ranges", async () => {
    mockListTopScores.mockResolvedValue(mockScores);

    render(<LeadScoringPanel />, { wrapper: createWrapper() });

    await screen.findByText("85");

    expect(screen.getByText("Alto")).toBeInTheDocument();
    expect(screen.getByText("Medio")).toBeInTheDocument();
    expect(screen.getByText("Bajo")).toBeInTheDocument();
  });

  it("shows empty state when no scores exist", async () => {
    mockListTopScores.mockResolvedValue([]);

    render(<LeadScoringPanel />, { wrapper: createWrapper() });

    await screen.findByText("Sin leads registrados");

    expect(screen.getByText("Sin leads registrados")).toBeInTheDocument();
  });

  it("renders section heading", async () => {
    mockListTopScores.mockResolvedValue(mockScores);

    render(<LeadScoringPanel />, { wrapper: createWrapper() });

    await screen.findByText("Lead Scoring");

    expect(screen.getByText("Lead Scoring")).toBeInTheDocument();
  });

  it("calls listTopScores with default limit", async () => {
    mockListTopScores.mockResolvedValue([]);

    render(<LeadScoringPanel />, { wrapper: createWrapper() });

    await screen.findByText("Sin leads registrados");

    expect(mockListTopScores).toHaveBeenCalledWith(20);
  });
});
