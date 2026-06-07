import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { MarkerPopup } from "@/presentation/components/map/MarkerPopup";
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

describe("MarkerPopup", () => {
  it("(1) uses the property's first image when imagenes is non-empty", () => {
    const { getByRole } = render(<MarkerPopup propiedad={makeProp()} />);
    const img = getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.example.com/img1.jpg");
  });

  it("(2) falls back to /placeholder.svg when imagenes is empty (?? placeholder branch)", () => {
    const { getByRole } = render(<MarkerPopup propiedad={makeProp({ imagenes: [] })} />);
    const img = getByRole("img");
    expect(img.getAttribute("src")).toContain("placeholder.svg");
  });

  it("(3) prefixes distrito with a comma+space when distrito is present (truthy branch)", () => {
    const { getByText } = render(
      <MarkerPopup propiedad={makeProp({ distrito: "Miraflores", ciudad: "Lima" })} />,
    );
    expect(getByText("Miraflores, Lima")).toBeInTheDocument();
  });

  it("(4) shows just ciudad when distrito is undefined (falsy branch)", () => {
    const { getByText } = render(<MarkerPopup propiedad={makeProp({ ciudad: "Lima" })} />);
    // The "Lima" text node should exist; the false branch shows just the city
    expect(getByText("Lima")).toBeInTheDocument();
  });
});
