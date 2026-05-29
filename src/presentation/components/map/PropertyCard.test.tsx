import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PropertyCard } from "./PropertyCard";
import type { Propiedad } from "@/domain/entities/propiedad";

const basePropiedad: Propiedad = {
  id: "1",
  codigo: "PROP-001",
  tipo: "departamento",
  estado: "disponible",
  precio: 250000,
  moneda: "USD",
  titulo: "Departamento Test",
  descripcion: "Un departamento de prueba",
  areaM2: 80,
  cuartos: 3,
  banios: 2,
  ciudad: "Lima",
  distrito: "Miraflores",
  imagenes: [],
  publicada: true,
  destacada: false,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("PropertyCard", () => {
  it("renders the Building icon in image fallback when no images", () => {
    render(<PropertyCard propiedad={basePropiedad} />);

    // The Building icon should be rendered as an SVG
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // It should have aria-label for accessibility
    expect(svg).toHaveAttribute("aria-label", "Sin imagen");
  });

  it("renders property title", () => {
    render(<PropertyCard propiedad={basePropiedad} />);

    expect(screen.getByText("Departamento Test")).toBeInTheDocument();
  });

  it("does NOT render 🏗️ emoji", () => {
    render(<PropertyCard propiedad={basePropiedad} />);

    expect(screen.queryByText("🏗️")).not.toBeInTheDocument();
  });
});
