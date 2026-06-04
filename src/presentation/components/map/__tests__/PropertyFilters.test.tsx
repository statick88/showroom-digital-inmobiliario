import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { PropertyFilters, type FiltersState } from "@/presentation/components/map/PropertyFilters";

// Mock Input to a controlled <input>
vi.mock("@/components/ui/input", () => ({
  Input: ({
    type,
    value,
    onChange,
    placeholder,
  }: {
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid={`input-${placeholder ?? "default"}`}
      type={type ?? "text"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

const initialFilters: FiltersState = {
  tipo: "",
  estado: "",
  distrito: "",
  precioMin: "",
  precioMax: "",
  moneda: "",
};

function renderFilters(overrides: Partial<FiltersState> = {}) {
  const onFilterChange = vi.fn();
  const filters = { ...initialFilters, ...overrides };
  const result = render(<PropertyFilters filters={filters} onFilterChange={onFilterChange} />);
  return { ...result, onFilterChange, filters };
}

/** The PropertyFilters component renders <label>...</label><select/...> pairs.
 *  We can find the select by walking from the label's text via the parent
 *  div and locating the only <select> inside. */
function getSelectByLabel(labelText: string): HTMLSelectElement {
  const label = screen.getByText(labelText);
  const wrapper = label.parentElement!;
  const select = wrapper.querySelector("select");
  if (!select) throw new Error(`No <select> inside the wrapper for label "${labelText}"`);
  return select;
}

describe("PropertyFilters — presentational filter panel", () => {
  it("(1) renders the 'Filtros' label by default", () => {
    renderFilters();
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("(2) shows the 'Limpiar filtros' button only when at least one filter is active", () => {
    const { rerender, onFilterChange } = renderFilters();
    expect(screen.queryByRole("button", { name: /Limpiar/i })).not.toBeInTheDocument();

    rerender(
      <PropertyFilters
        filters={{ ...initialFilters, estado: "disponible" }}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
  });

  it("(3) 'Limpiar filtros' button calls onFilterChange with all-empty filters", () => {
    const { onFilterChange } = renderFilters({ estado: "vendido", distrito: "Miraflores" });

    const clearBtn = screen.getByRole("button", { name: /Limpiar/i });
    fireEvent.click(clearBtn);

    expect(onFilterChange).toHaveBeenCalledWith({
      tipo: "",
      estado: "",
      distrito: "",
      precioMin: "",
      precioMax: "",
      moneda: "",
    });
  });

  it("(4) changing the 'Tipo' select calls onFilterChange with the new tipo", () => {
    const { onFilterChange } = renderFilters();
    const tipoSelect = getSelectByLabel("Tipo");
    fireEvent.change(tipoSelect, { target: { value: "departamento" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      tipo: "departamento",
    });
  });

  it("(5) changing the 'Estado' select calls onFilterChange with the new estado", () => {
    const { onFilterChange } = renderFilters();
    const estadoSelect = getSelectByLabel("Estado");
    fireEvent.change(estadoSelect, { target: { value: "vendido" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      estado: "vendido",
    });
  });

  it("(6) changing the 'Distrito' select calls onFilterChange with the new distrito", () => {
    const { onFilterChange } = renderFilters();
    const distritoSelect = getSelectByLabel("Distrito");
    fireEvent.change(distritoSelect, { target: { value: "Surco" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      distrito: "Surco",
    });
  });

  it("(7) changing the 'Moneda' select calls onFilterChange with the new moneda", () => {
    const { onFilterChange } = renderFilters();
    const monedaSelect = getSelectByLabel("Moneda");
    fireEvent.change(monedaSelect, { target: { value: "USD" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      moneda: "USD",
    });
  });

  it("(8) editing the 'Precio min' input calls onFilterChange with the new precioMin (string)", () => {
    const { onFilterChange } = renderFilters();
    const minInput = screen.getByTestId("input-0");
    fireEvent.change(minInput, { target: { value: "100000" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      precioMin: "100000",
    });
  });

  it("(9) editing the 'Precio max' input calls onFilterChange with the new precioMax (string)", () => {
    const { onFilterChange } = renderFilters();
    const maxInput = screen.getByTestId("input-999999");
    fireEvent.change(maxInput, { target: { value: "500000" } });
    expect(onFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      precioMax: "500000",
    });
  });

  it("(10) Distrito options include the 10 documented Lima districts plus a 'Todos' default", () => {
    renderFilters();
    const distritoSelect = getSelectByLabel("Distrito");
    const options = within(distritoSelect).getAllByRole("option");
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("Todos");
    expect(labels).toContain("San Isidro");
    expect(labels).toContain("Miraflores");
    expect(labels).toContain("Barranco");
    expect(labels).toContain("La Molina");
    expect(labels).toContain("Surco");
    expect(labels).toContain("San Borja");
    expect(labels).toContain("Jesus María");
    expect(labels).toContain("Lince");
    expect(labels).toContain("Magdalena");
    expect(labels).toContain("Pueblo Libre");
  });

  it("(11) Tipo options include Lote, Departamento, Casa, Local + 'Todos'", () => {
    renderFilters();
    const tipoSelect = getSelectByLabel("Tipo");
    const labels = within(tipoSelect)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(labels).toEqual(["Todos", "Lote", "Departamento", "Casa", "Local"]);
  });

  it("(12) Estado options include Disponible, Separado, Vendido + 'Todos'", () => {
    renderFilters();
    const estadoSelect = getSelectByLabel("Estado");
    const labels = within(estadoSelect)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(labels).toEqual(["Todos", "Disponible", "Separado", "Vendido"]);
  });

  it("(13) Moneda options include S/, $ + 'Todas'", () => {
    renderFilters();
    const monedaSelect = getSelectByLabel("Moneda");
    const labels = within(monedaSelect)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(labels).toEqual(["Todas", "S/", "$"]);
  });

  it("(14) shows the 'Limpiar filtros' button when ONLY precioMin is set", () => {
    const { rerender, onFilterChange } = renderFilters();
    rerender(
      <PropertyFilters
        filters={{ ...initialFilters, precioMin: "100" }}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
  });

  it("(15) shows the 'Limpiar filtros' button when ONLY moneda is set", () => {
    const { rerender, onFilterChange } = renderFilters();
    rerender(
      <PropertyFilters
        filters={{ ...initialFilters, moneda: "PEN" }}
        onFilterChange={onFilterChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Limpiar/i })).toBeInTheDocument();
  });
});
