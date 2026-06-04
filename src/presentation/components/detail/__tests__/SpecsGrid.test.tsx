import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { SpecsGrid } from "@/presentation/components/detail/SpecsGrid";
import type { Propiedad } from "@/domain/entities/propiedad";

function makeProp(overrides: Partial<Propiedad> = {}): Propiedad {
  return {
    id: "prop-1",
    codigo: "P-001",
    tipo: "casa",
    estado: "disponible",
    precio: 100000,
    moneda: "USD",
    titulo: "Casa en Miraflores",
    ciudad: "Lima",
    imagenes: [],
    publicada: true,
    destacada: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("SpecsGrid", () => {
  it("(1) returns null when propiedad is null (early return branch)", () => {
    const { container } = render(<SpecsGrid propiedad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("(2) renders m², dormitorios, baños labels and the provided values", () => {
    const propiedad = makeProp({ areaM2: 120, cuartos: 3, banios: 2 });
    const { getByText } = render(<SpecsGrid propiedad={propiedad} />);

    expect(getByText("120")).toBeInTheDocument();
    expect(getByText("m²")).toBeInTheDocument();
    expect(getByText("3")).toBeInTheDocument();
    expect(getByText("dormitorios")).toBeInTheDocument();
    expect(getByText("2")).toBeInTheDocument();
    expect(getByText("baños")).toBeInTheDocument();
  });

  it("(3) shows '-' for areaM2/cuartos/banios when those fields are undefined (?? '-' fallback branches)", () => {
    const propiedad = makeProp(); // no areaM2/cuartos/banios
    const { getAllByText, container } = render(<SpecsGrid propiedad={propiedad} />);

    // All three specs should render a '-' character
    const dashes = getAllByText("-");
    expect(dashes).toHaveLength(3);
    // The grid container should be present
    expect(container.querySelector(".grid")).toBeInTheDocument();
  });
});
