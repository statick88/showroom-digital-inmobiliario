import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VendedorDashboard } from "@/presentation/components/vendedor/VendedorDashboard";

vi.mock("@/presentation/hooks/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/presentation/hooks/useCommissions", () => ({
  useCommissions: vi.fn(),
  useCommissionRules: vi.fn(),
}));

vi.mock("@/presentation/components/vendedor/CommissionTable", () => ({
  CommissionTable: ({ vendedorId }: { vendedorId: string }) => (
    <div data-testid="commission-table">CommissionTable for {vendedorId}</div>
  ),
}));

vi.mock("@/presentation/components/vendedor/TeamLeadsView", () => ({
  TeamLeadsView: () => <div data-testid="team-leads-view">TeamLeadsView</div>,
}));

import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { useCommissions } from "@/presentation/hooks/useCommissions";

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseCommissions = vi.mocked(useCommissions);

describe("VendedorDashboard (PR-4) — component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with vendedor name", () => {
    mockUseAuthStore.mockReturnValue({
      nombre: "Carlos Vendedor",
      id: "v1",
    } as ReturnType<typeof useAuthStore>);
    mockUseCommissions.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<VendedorDashboard />);

    expect(screen.getByText("Dashboard Vendedor")).toBeInTheDocument();
    expect(screen.getByText("Carlos Vendedor")).toBeInTheDocument();
  });

  it("renders CommissionTable and TeamLeadsView", () => {
    mockUseAuthStore.mockReturnValue({
      nombre: "Carlos",
      id: "v1",
    } as ReturnType<typeof useAuthStore>);
    mockUseCommissions.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<VendedorDashboard />);

    expect(screen.getByTestId("commission-table")).toBeInTheDocument();
    expect(screen.getByTestId("team-leads-view")).toBeInTheDocument();
  });

  it("shows commission summary stats", () => {
    mockUseAuthStore.mockReturnValue({
      nombre: "Carlos",
      id: "v1",
    } as ReturnType<typeof useAuthStore>);
    mockUseCommissions.mockReturnValue({
      data: [
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
      ],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<VendedorDashboard />);

    expect(screen.getByText("Resumen de Comisiones")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows total commission amount", () => {
    mockUseAuthStore.mockReturnValue({
      nombre: "Carlos",
      id: "v1",
    } as ReturnType<typeof useAuthStore>);
    mockUseCommissions.mockReturnValue({
      data: [
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
      ],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<VendedorDashboard />);

    expect(screen.getByText("S/ 23,000")).toBeInTheDocument();
  });

  it("shows pending commissions count", () => {
    mockUseAuthStore.mockReturnValue({
      nombre: "Carlos",
      id: "v1",
    } as ReturnType<typeof useAuthStore>);
    mockUseCommissions.mockReturnValue({
      data: [
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
      ],
      isLoading: false,
    } as ReturnType<typeof useCommissions>);

    render(<VendedorDashboard />);

    expect(screen.getByText("Pendientes")).toBeInTheDocument();
  });
});
