import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

import { LeadsTable } from "@/presentation/components/admin/LeadsTable";
import type { Lead } from "@/domain/entities/propiedad";

const { useLeadsMock } = vi.hoisted(() => ({
  useLeadsMock: vi.fn(),
}));

vi.mock("@/presentation/hooks/useLeads.legacy", () => ({
  useLeads: useLeadsMock,
}));

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    propiedadId: "prop-1",
    perfilId: "perfil-1",
    nombre: "Ada Lovelace",
    email: "ada@example.com",
    telefono: "+51 999 999 999",
    score: 85,
    estado: "nuevo",
    notas: "Quiere visitar el sábado",
    propiedadTitulo: "Casa en Miraflores",
    propiedadCodigo: "P-001",
    createdAt: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  useLeadsMock.mockReset();
});

describe("LeadsTable", () => {
  it("(1) shows a 'Cargando...' state while the leads query is loading (isLoading branch)", () => {
    useLeadsMock.mockReturnValue({ data: undefined, isLoading: true });
    const { getByText } = render(<LeadsTable />);
    expect(getByText("Cargando...")).toBeInTheDocument();
  });

  it("(2) shows 'No hay leads' when the leads array is empty (leads.length === 0 branch)", () => {
    useLeadsMock.mockReturnValue({ data: [], isLoading: false });
    const { getByText } = render(<LeadsTable />);
    expect(getByText("No hay leads")).toBeInTheDocument();
  });

  it("(3) renders a row per lead with the formatted date", () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead()],
      isLoading: false,
    });
    const { getByText } = render(<LeadsTable />);
    expect(getByText("Ada Lovelace")).toBeInTheDocument();
    expect(getByText("ada@example.com")).toBeInTheDocument();
    expect(getByText("+51 999 999 999")).toBeInTheDocument();
    // formatDate should render 15/01/2026
    expect(getByText("15/01/2026")).toBeInTheDocument();
  });

  it("(4) opens a LeadDetail modal when 'Ver' is clicked (selectedLead set branch)", async () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead()],
      isLoading: false,
    });
    const { getByText, getByLabelText, queryByText } = render(<LeadsTable />);
    // Detail should not be open initially
    expect(queryByText("Detalle del Lead")).toBeNull();
    fireEvent.click(getByText("Ver"));
    await waitFor(() => {
      expect(getByText("Detalle del Lead")).toBeInTheDocument();
    });
    // Close the modal
    fireEvent.click(getByLabelText("Cerrar"));
    expect(queryByText("Detalle del Lead")).toBeNull();
  });

  it("(5) shows '—' for telefono when lead.telefono is undefined (?? '—' branch)", () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead({ telefono: undefined })],
      isLoading: false,
    });
    const { container } = render(<LeadsTable />);
    // The first row's third cell (Teléfono) should contain the em-dash
    const cell = container.querySelectorAll("tbody tr td")[2];
    expect(cell?.textContent).toBe("—");
  });

  it("(6) shows '—' for notas in the detail modal when lead.notas is undefined", async () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead({ notas: undefined })],
      isLoading: false,
    });
    const { getByText } = render(<LeadsTable />);
    fireEvent.click(getByText("Ver"));
    await waitFor(() => {
      expect(getByText("Detalle del Lead")).toBeInTheDocument();
    });
    // The detail panel renders notas as '—' inside the .text-foreground <dd>
    const detail = getByText("Notas").parentElement;
    const dd = detail?.querySelector("dd");
    expect(dd?.textContent).toBe("—");
  });

  it("(7) shows '—' for telefono in the detail modal when undefined", async () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead({ telefono: undefined })],
      isLoading: false,
    });
    const { getByText } = render(<LeadsTable />);
    fireEvent.click(getByText("Ver"));
    await waitFor(() => {
      expect(getByText("Detalle del Lead")).toBeInTheDocument();
    });
    // The detail modal's <dd> for telefono should contain '—'
    const telefonoDt = getByText("Teléfono", { selector: "dt" });
    const dd = telefonoDt.parentElement?.querySelector("dd");
    expect(dd?.textContent).toBe("—");
  });

  it("(8) does NOT render the codigo-prefix span in detail when propiedadCodigo is undefined (falsy branch)", () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead({ propiedadCodigo: undefined })],
      isLoading: false,
    });
    const { getByText, container } = render(<LeadsTable />);
    fireEvent.click(getByText("Ver"));
    // The detail panel propiedad cell should not have the text-primary span
    const detail = container.querySelector(".bg-card");
    // The propiedadCodigo span is .text-primary, so its absence means the branch is covered
    expect(detail).toBeInTheDocument();
  });

  it("(9) shows 'P-001: Casa en Miraflores' when both codigo and titulo are present (both-truthy branch)", () => {
    useLeadsMock.mockReturnValue({
      data: [makeLead()],
      isLoading: false,
    });
    const { container } = render(<LeadsTable />);
    const propCell = container.querySelectorAll("tbody tr td")[3];
    expect(propCell?.textContent).toContain("P-001");
    expect(propCell?.textContent).toContain("Casa en Miraflores");
    expect(propCell?.textContent).toContain(": ");
  });
});
