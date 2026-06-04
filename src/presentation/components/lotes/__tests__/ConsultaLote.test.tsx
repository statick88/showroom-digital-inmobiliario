import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { ConsultaLote } from "@/presentation/components/lotes/ConsultaLote";
import type { Lote } from "@/domain/entities/lote";
import { makeLoteFixture } from "@/test-utils/mockLotesRepository";
import { createMockUseClickTracker } from "@/test-utils/mockUseClickTracker";

// ── Mock Icon to render an svg with data-icon (so we can query buttons) ──
vi.mock("@/components/ui/icon", () => ({
  Icon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />,
}));

// ── Mock useClickTracker ───────────────────────────────────────────
const tracker = createMockUseClickTracker();
vi.mock("@/presentation/hooks/useClickTracker", () => ({
  useClickTracker: () => tracker,
}));

// ── Mock Turnstile (added in PR-3 GAP-2; today it doesn't exist yet) ──
// We don't reference @marsidev/react-turnstile in PR-1 because ConsultaLote
// doesn't use it. The TODO test (5) documents the future ThrottledSubmit
// behavior with Turnstile.

const lote: Lote = makeLoteFixture({ id: "lote-consulta-1", codigo: "LT-007" });

beforeEach(() => {
  tracker.trackClick.mockClear();
});

describe("ConsultaLote — retro tests (T-1.3, PR-1 foundations)", () => {
  it("(1) renders form with default fields (Nombre, Correo, Telefono, submit button)", () => {
    const onClose = vi.fn();
    render(<ConsultaLote lote={lote} onClose={onClose} />);

    // The heading includes the lote codigo
    expect(screen.getByRole("heading", { name: /LT-007/ })).toBeInTheDocument();
    // The three form fields
    expect(screen.getByPlaceholderText("Tu nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tu@correo.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("999 999 999")).toBeInTheDocument();
    // The submit button
    expect(screen.getByRole("button", { name: "Enviar consulta" })).toBeInTheDocument();
  });

  it("(1b) submit fires onClose (current behavior — no LPDP gate yet)", () => {
    // Documents today's behavior: any submit closes the modal. PR-3 (T-3.1 +
    // GAP-2) will gate this on LPDP consent.
    const onClose = vi.fn();
    render(<ConsultaLote lote={lote} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText("Tu nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByPlaceholderText("tu@correo.com"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("999 999 999"), {
      target: { value: "999111222" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ConsultaLote — [TODO] future scenarios (land in PR-3 GAP-2 / T-3.1)", () => {
  // Spec T-1.3 acceptance scenario (2): submit blocked until LPDP consent
  // checkbox is checked. LPDP gate is added in PR-3 (GAP-1/T-3.1 alongside
  // bimoneda + click-tracking wiring).
  it.todo("submit blocked until LPDP consent checkbox is checked (PR-3)");

  // Spec T-1.3 acceptance scenario (3): invalid CCI '002-123' shows Spanish
  // error "CCI debe tener formato 002-XXXXXXXXXXXXXXXX-XX". cciSchema lands
  // in PR-2 (T-2.3), schema wiring into ConsultaLote in PR-3 (GAP-2).
  it.todo("invalid CCI '002-123' shows Spanish Zod error (PR-2 T-2.3 / PR-3 GAP-2)");

  // Spec T-1.3 acceptance scenario (4): valid CCI submits and calls
  // trackClick(lote.id, 'consulta'). Click-tracking call site + 'consulta'
  // TipoEvento extension lands in PR-3 (T-3.2).
  it.todo(
    "valid CCI submits and calls trackClick(lote.id, 'consulta') (PR-3 T-3.2)",
  );

  // Spec T-1.3 acceptance scenario (5): throttled submit (Turnstile token
  // reused) shows rate-limit error. Turnstile is added in PR-3 alongside
  // click tracking.
  it.todo("throttled submit (Turnstile token reused) shows rate-limit error (PR-3)");
});
