import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommissionTable } from "@/presentation/components/vendedor/CommissionTable";

vi.mock("@/presentation/hooks/useCommissions", () => ({
  useCommissions: vi.fn(),
}));

import { useCommissions } from "@/presentation/hooks/useCommissions";

const mockUseCommissions = vi.mocked(useCommissions);

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
  {
    id: "c3",
    vendedorId: "v1",
    propertyId: "p3",
    salePrice: 800000,
    commissionAmount: 20000,
    status: "paid",
    createdAt: "2026-01-03T00:00:00Z",
  },
];

describe("CommissionTable (PR-4) — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders commission rows with correct data", () => {
    mockUseCommissions.mockReturnValue({
      data: mockCommissions,
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("S/ 8,000")).toBeInTheDocument();
    expect(screen.getByText("S/ 15,000")).toBeInTheDocument();
    expect(screen.getByText("S/ 20,000")).toBeInTheDocument();
  });

  it("shows pending status badge", () => {
    mockUseCommissions.mockReturnValue({
      data: [mockCommissions[0]],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("shows approved status badge", () => {
    mockUseCommissions.mockReturnValue({
      data: [mockCommissions[1]],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("Aprobado")).toBeInTheDocument();
  });

  it("shows paid status badge", () => {
    mockUseCommissions.mockReturnValue({
      data: [mockCommissions[2]],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("Pagado")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseCommissions.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("Cargando comisiones...")).toBeInTheDocument();
  });

  it("shows empty state when no commissions", () => {
    mockUseCommissions.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("Sin comisiones registradas")).toBeInTheDocument();
  });

  it("displays sale price formatted as PEN currency", () => {
    mockUseCommissions.mockReturnValue({
      data: [mockCommissions[0]],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<CommissionTable vendedorId="v1" />);

    expect(screen.getByText("S/ 400,000")).toBeInTheDocument();
  });
});
