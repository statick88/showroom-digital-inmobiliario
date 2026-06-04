import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { FichaTecnicaLote } from "@/presentation/components/lotes/FichaTecnicaLote";
import type { Lote } from "@/domain/entities/lote";
import { createMockUseClickTracker } from "@/test-utils/mockUseClickTracker";

// ── Mock useClickTracker ───────────────────────────────────────────
const tracker = createMockUseClickTracker();
vi.mock("@/presentation/hooks/useClickTracker", () => ({
  useClickTracker: () => tracker,
}));

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

// ── Mock Icon — render a <svg> with a data-icon attribute so we can query it
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

beforeEach(() => {
  tracker.trackClick.mockClear();
});

describe("FichaTecnicaLote — retro tests (T-1.1, PR-1 foundations)", () => {
  it("(1) renders lot details from props (codigo, descripcion, precio, area)", () => {
    render(<FichaTecnicaLote lote={baseLote} onClose={vi.fn()} />);

    // The lot code appears in the title
    expect(screen.getByRole("heading", { name: "LT-042" })).toBeInTheDocument();
    // Description appears as supporting text
    expect(screen.getByText("Lote esquinero con vista al parque")).toBeInTheDocument();
    // Price formatted with S/ symbol and es-PE locale (450000 -> "450,000")
    expect(screen.getByText(/S\/.*450,000/)).toBeInTheDocument();
    // Area in m²
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it("(2) close button (X icon) invokes onClose when clicked", () => {
    const onClose = vi.fn();
    render(<FichaTecnicaLote lote={baseLote} onClose={onClose} />);

    // The close button contains the "close" icon — find the SVG with that data-icon
    const closeIcon = screen.getByTestId ? null : null; // placeholder
    const closeIconSvg = document.querySelector('[data-icon="close"]');
    expect(closeIconSvg).toBeTruthy();
    const closeButton = closeIconSvg?.closest("button");
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("(2b) clicking the backdrop invokes onClose", () => {
    const onClose = vi.fn();
    const { container } = render(<FichaTecnicaLote lote={baseLote} onClose={onClose} />);
    // The outer div is the backdrop
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("(extra) status chip reflects the lote.estado value (reservado -> separado)", () => {
    render(<FichaTecnicaLote lote={{ ...baseLote, estado: "reservado" }} onClose={vi.fn()} />);
    const chip = screen.getByTestId("status-chip");
    // The component remaps "reservado" -> "separado" before passing to StatusChip
    // because StatusChip accepts EstadoPropiedad, not EstadoLote.
    expect(chip.getAttribute("data-status")).toBe("separado");
  });
});

describe("FichaTecnicaLote — [TODO] future scenarios (land in PR-3 / PR-4)", () => {
  // Spec T-1.1 acceptance scenario (3): reservation button invokes onReservar
  // and disables when modoVendedor=false. Current implementation has the
  // modoVendedor buttons but no `onReservar` prop and no disabled state.
  // Implementation lands in PR-4 (HU-008).
  it.todo(
    "reservation button invokes onReservar and disables when modoVendedor=false (PR-4)",
  );

  // Spec T-1.1 acceptance scenario (4): useEffect calls
  // trackClick(lote.id, 'vista_detalle') on mount. This is GAP-3 click-tracking
  // call-site coverage on FichaTecnicaLote. Implementation lands in PR-3 (T-3.2).
  it.todo("useEffect calls trackClick(lote.id, 'vista_detalle') on mount (PR-3 T-3.2)");

  // Spec T-1.1 acceptance scenario (5): Zod-validated CCI field shows error for
  // '002-123'. Schema lands in PR-2 (T-2.3), schema wiring into FichaTecnicaLote
  // lands in PR-3 (GAP-2 + T-3.1).
  it.todo("Zod-validated CCI field shows error for '002-123' (PR-2 T-2.3 / PR-3 GAP-2)");
});
