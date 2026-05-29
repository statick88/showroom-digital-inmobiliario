import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PropertyDetailPanel } from "./PropertyDetailPanel";
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

describe("PropertyDetailPanel", () => {
  it("renders property title when open", () => {
    render(
      <PropertyDetailPanel
        propiedad={basePropiedad}
        open={true}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Departamento Test")).toBeInTheDocument();
  });

  it("shows estado badge when open", () => {
    render(
      <PropertyDetailPanel
        propiedad={basePropiedad}
        open={true}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("does NOT render 🏗️ emoji", () => {
    render(
      <PropertyDetailPanel
        propiedad={basePropiedad}
        open={true}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText("🏗️")).not.toBeInTheDocument();
  });

  it("renders property title when open", () => {
    render(
      <PropertyDetailPanel
        propiedad={basePropiedad}
        open={true}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Departamento Test")).toBeInTheDocument();
  });

  it("returns null when propiedad is null", () => {
    const { container } = render(
      <PropertyDetailPanel
        propiedad={null}
        open={true}
        onClose={() => {}}
      />,
    );

    expect(container.innerHTML).toBe("");
  });
});
