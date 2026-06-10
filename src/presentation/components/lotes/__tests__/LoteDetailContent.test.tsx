import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { LoteDetailContent } from "@/presentation/components/lotes/LoteDetailContent";
import type { Lote } from "@/domain/entities/lote";

// ── Mock ConsultaLote child ────────────────────────────────────────
vi.mock("@/presentation/components/lotes/ConsultaLote", () => ({
  ConsultaLote: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="consulta-modal">
      <button onClick={onClose}>Cerrar consulta</button>
    </div>
  ),
}));

// ── Mock StatusChip ────────────────────────────────────────────────
vi.mock("@/components/ui/status-chip", () => ({
  StatusChip: ({ status, size }: { status: string; size?: string }) => (
    <span data-testid="status-chip" data-status={status} data-size={size}>
      {status}
    </span>
  ),
}));

// ── Mock Icon ──────────────────────────────────────────────────────
vi.mock("@/components/ui/icon", () => ({
  Icon: ({ name, size }: { name: string; size?: number }) => (
    <svg data-icon={name} data-size={size} aria-hidden="true" />
  ),
}));

// ── Fixture ────────────────────────────────────────────────────────
const baseLote: Lote = {
  id: "lote-abc-123",
  proyectoId: "proy-1",
  codigo: "LT-042",
  areaTotal: 200,
  frente: 10,
  fondo: 20,
  precio: 450000,
  moneda: "PEN",
  estado: "disponible",
  poligonoCoords: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
  imagenPlano: "https://example.com/plano.png",
  descripcion: "Lote esquinero con vista al parque",
  orden: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("LoteDetailContent — extracted presentational component", () => {
  it("renders lot code as heading", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "LT-042" })).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByText("Lote esquinero con vista al parque")).toBeInTheDocument();
  });

  it("renders formatted price with S/ for PEN currency", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByText(/S\/.*450,000/)).toBeInTheDocument();
  });

  it("renders formatted price with $ for USD currency", () => {
    const usdLote = { ...baseLote, moneda: "USD" as const, precio: 120000 };
    render(<LoteDetailContent lote={usdLote} onClose={vi.fn()} />);
    expect(screen.getByText(/\$.*120,000/)).toBeInTheDocument();
  });

  it("renders area in m²", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByText("Área Total")).toBeInTheDocument();
    expect(screen.getByText("200 m²")).toBeInTheDocument();
  });

  it("renders frente when provided", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByText("Frente")).toBeInTheDocument();
    expect(screen.getByText("10 m")).toBeInTheDocument();
  });

  it("renders fondo when provided", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByText("Fondo")).toBeInTheDocument();
    expect(screen.getByText("20 m")).toBeInTheDocument();
  });

  it("hides frente and fondo when not provided", () => {
    const loteNoDimensions = { ...baseLote, frente: undefined, fondo: undefined };
    render(<LoteDetailContent lote={loteNoDimensions} onClose={vi.fn()} />);
    // Only area should be shown, not frente/fondo labels
    expect(screen.getByText("Área Total")).toBeInTheDocument();
    expect(screen.queryByText("Frente")).not.toBeInTheDocument();
    expect(screen.queryByText("Fondo")).not.toBeInTheDocument();
  });

  it("renders imagenPlano when provided", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    const img = screen.getByAltText("Plano lote LT-042");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("https://example.com/plano.png");
  });

  it("hides imagenPlano when not provided", () => {
    const loteNoImage = { ...baseLote, imagenPlano: undefined };
    render(<LoteDetailContent lote={loteNoImage} onClose={vi.fn()} />);
    expect(screen.queryByAltText("Plano lote LT-042")).not.toBeInTheDocument();
  });

  it("shows Me interesa button for available lots (non-vendedor mode)", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Me interesa/i })).toBeInTheDocument();
  });

  it("hides Me interesa button when modoVendedor is true", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} modoVendedor={true} />);
    expect(screen.queryByRole("button", { name: /Me interesa/i })).not.toBeInTheDocument();
  });

  it("hides Me interesa for non-available lots", () => {
    const vendidoLote = { ...baseLote, estado: "vendido" as const };
    render(<LoteDetailContent lote={vendidoLote} onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Me interesa/i })).not.toBeInTheDocument();
  });

  it("renders status chip with correct status", () => {
    render(<LoteDetailContent lote={baseLote} onClose={vi.fn()} />);
    const chip = screen.getByTestId("status-chip");
    expect(chip.getAttribute("data-status")).toBe("disponible");
  });

  it("remaps reservado to separado for status chip", () => {
    const reservadoLote = { ...baseLote, estado: "reservado" as const };
    render(<LoteDetailContent lote={reservadoLote} onClose={vi.fn()} />);
    const chip = screen.getByTestId("status-chip");
    expect(chip.getAttribute("data-status")).toBe("separado");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<LoteDetailContent lote={baseLote} onClose={onClose} />);
    const closeIconSvg = document.querySelector('[data-icon="close"]');
    const closeButton = closeIconSvg?.closest("button");
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders fallback description when descripcion is empty", () => {
    const loteNoDesc = { ...baseLote, descripcion: undefined };
    render(<LoteDetailContent lote={loteNoDesc} onClose={vi.fn()} />);
    expect(screen.getByText("Lote en proyecto")).toBeInTheDocument();
  });
});
