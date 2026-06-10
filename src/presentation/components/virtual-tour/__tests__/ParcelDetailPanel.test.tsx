import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ParcelDetailPanel } from "@/presentation/components/virtual-tour/ParcelDetailPanel";
import type { Lote } from "@/domain/entities/lote";

// ── Mock useWhatsAppTour ───────────────────────────────────────────
const openWhatsAppMock = vi.fn();
vi.mock("@/presentation/hooks/useWhatsAppTour", () => ({
  useWhatsAppTour: () => ({
    openWhatsApp: openWhatsAppMock,
    isTracking: false,
  }),
}));

// ── Mock LoteDetailContent ─────────────────────────────────────────
vi.mock("@/presentation/components/lotes/LoteDetailContent", () => ({
  LoteDetailContent: ({ lote, onClose }: { lote: Lote; onClose: () => void }) => (
    <div data-testid="lote-detail-content">
      <span data-testid="lote-code">{lote.codigo}</span>
      <button onClick={onClose}>Close</button>
    </div>
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
  poligonoCoords: [],
  orden: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  openWhatsAppMock.mockClear();
});

describe("ParcelDetailPanel", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={false} onClose={vi.fn()} />
    );
    expect(screen.queryByTestId("lote-detail-content")).not.toBeInTheDocument();
  });

  it("renders LoteDetailContent when isOpen is true", () => {
    render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByTestId("lote-detail-content")).toBeInTheDocument();
  });

  it("passes lote to LoteDetailContent", () => {
    render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByTestId("lote-code")).toHaveTextContent("LT-042");
  });

  it("renders WhatsApp CTA button", () => {
    render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: /whatsapp/i })).toBeInTheDocument();
  });

  it("calls useWhatsAppTour openWhatsApp when CTA is clicked", () => {
    render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={true} onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /whatsapp/i }));
    expect(openWhatsAppMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ParcelDetailPanel lote={baseLote} tourId="tour-abc" isOpen={true} onClose={onClose} />
    );
    // The backdrop is the first child div with bg-black/40
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when lote is null", () => {
    render(
      <ParcelDetailPanel lote={null} tourId="tour-abc" isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.queryByTestId("lote-detail-content")).not.toBeInTheDocument();
  });
});
