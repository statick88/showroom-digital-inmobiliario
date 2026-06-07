import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { HeroProyecto } from "@/presentation/components/shared/HeroProyecto";

vi.mock("@/presentation/components/map/Tour360", () => ({
  Tour360: ({ titulo, onClose }: { titulo?: string; onClose?: () => void }) => (
    <div data-testid="tour360-mock">
      <span>{titulo}</span>
      {onClose && <button onClick={onClose}>Cerrar tour</button>}
    </div>
  ),
}));

describe("HeroProyecto", () => {
  it("renders the hero content and opens the 360 modal when available", () => {
    render(
      <HeroProyecto
        nombre="Proyecto Demo"
        descripcion="Una comunidad nueva"
        imagenUrl="https://cdn.example.com/hero.jpg"
        imagenes360={["https://cdn.example.com/tour.jpg"]}
      />,
    );

    expect(screen.getByText("Proyecto Demo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ver tour 360°/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Ver tour 360°/i }));

    expect(screen.getByTestId("tour360-mock")).toBeInTheDocument();
    expect(screen.getByText(/Tour 360° — Proyecto Demo/)).toBeInTheDocument();
  });

  it("does not show the 360 button when no images are provided", () => {
    render(<HeroProyecto nombre="Proyecto Demo" />);

    expect(screen.queryByRole("button", { name: /Ver tour 360°/i })).not.toBeInTheDocument();
  });
});
