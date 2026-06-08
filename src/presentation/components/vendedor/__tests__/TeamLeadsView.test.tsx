import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamLeadsView } from "@/presentation/components/vendedor/TeamLeadsView";

vi.mock("@/presentation/hooks/useLeadScoring", () => ({
  useTopLeadScores: vi.fn(),
}));

import { useTopLeadScores } from "@/presentation/hooks/useLeadScoring";

const mockUseTopLeadScores = vi.mocked(useTopLeadScores);

const mockLeads = [
  {
    id: "ls1",
    visitorId: "visitor-1",
    score: 85,
    breakdown: { views: 5, clicks: 3, time: 120, repeats: 2 },
    computedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ls2",
    visitorId: "visitor-2",
    score: 45,
    breakdown: { views: 2, clicks: 1, time: 30, repeats: 0 },
    computedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "ls3",
    visitorId: "visitor-3",
    score: 15,
    breakdown: { views: 1, clicks: 0, time: 0, repeats: 0 },
    computedAt: "2026-01-01T00:00:00Z",
  },
];

describe("TeamLeadsView (PR-4) — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders leads with correct scores", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("shows Alto label for high scores (61-100)", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: [mockLeads[0]],
      isLoading: false,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("Alto")).toBeInTheDocument();
  });

  it("shows Medio label for medium scores (31-60)", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: [mockLeads[1]],
      isLoading: false,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("shows Bajo label for low scores (0-30)", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: [mockLeads[2]],
      isLoading: false,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("Bajo")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("Cargando leads...")).toBeInTheDocument();
  });

  it("shows empty state when no leads", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<TeamLeadsView />);

    expect(screen.getByText("Sin leads registrados")).toBeInTheDocument();
  });

  it("displays visitor IDs for identification", () => {
    mockUseTopLeadScores.mockReturnValue({
      data: mockLeads,
      isLoading: false,
    } as ReturnType<typeof useTopLeadScores>);

    render(<TeamLeadsView />);

    expect(screen.getByText("visitor-1")).toBeInTheDocument();
    expect(screen.getByText("visitor-2")).toBeInTheDocument();
    expect(screen.getByText("visitor-3")).toBeInTheDocument();
  });
});
