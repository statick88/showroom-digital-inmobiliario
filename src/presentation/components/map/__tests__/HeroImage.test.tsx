import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { HeroImage } from "@/presentation/components/map/HeroImage";
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
    imagenes: ["https://cdn.example.com/img1.jpg"],
    publicada: true,
    destacada: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("HeroImage", () => {
  it("(1) returns null when propiedad is null (early return branch)", () => {
    const { container } = render(<HeroImage propiedad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("(2) renders an <img> tag when propiedad has images (hasImage=true branch)", () => {
    const { getByRole } = render(<HeroImage propiedad={makeProp()} />);
    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.example.com/img1.jpg");
    expect(img).toHaveAttribute("alt", "Casa en Miraflores");
  });

  it("(3) renders the Building icon fallback when imagenes array is empty (hasImage=false branch)", () => {
    const { getByLabelText, queryByRole } = render(
      <HeroImage propiedad={makeProp({ imagenes: [] })} />,
    );
    expect(getByLabelText("Sin imagen")).toBeInTheDocument();
    // No <img> tag rendered for the property
    expect(queryByRole("img")).toBeNull();
  });
});
