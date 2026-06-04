import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatusChip } from "@/components/ui/status-chip";

describe("components/ui/StatusChip", () => {
  it("(1) renders the 'Disponible' label for status='disponible'", () => {
    render(<StatusChip status="disponible" />);
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("(2) renders the 'Separado' label for status='separado'", () => {
    render(<StatusChip status="separado" />);
    expect(screen.getByText("Separado")).toBeInTheDocument();
  });

  it("(3) renders the 'Vendido' label for status='vendido'", () => {
    render(<StatusChip status="vendido" />);
    expect(screen.getByText("Vendido")).toBeInTheDocument();
  });

  it("(4) applies the 'sm' size class when size='sm' (px-2 py-0.5 text-xs)", () => {
    const { container } = render(<StatusChip status="disponible" size="sm" />);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("px-2");
    expect(span.className).toContain("py-0.5");
    expect(span.className).toContain("text-xs");
  });

  it("(5) applies the 'md' size class when size='md' (px-2.5 py-1 text-sm)", () => {
    const { container } = render(<StatusChip status="disponible" size="md" />);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("px-2.5");
    expect(span.className).toContain("py-1");
    expect(span.className).toContain("text-sm");
  });

  it("(6) shows the colored dot by default (showDot=true)", () => {
    const { container } = render(<StatusChip status="disponible" />);
    // Two spans: outer (chip) + inner (dot)
    const innerDot = container.querySelector("span span");
    expect(innerDot).toBeInTheDocument();
    expect(innerDot?.className).toContain("rounded-full");
    expect(innerDot?.className).toContain("bg-current");
  });

  it("(7) hides the dot when showDot=false", () => {
    const { container } = render(<StatusChip status="disponible" showDot={false} />);
    // Only one span: the outer chip, no inner dot
    const innerDot = container.querySelector("span span");
    expect(innerDot).not.toBeInTheDocument();
    // But the label is still there
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("(8) merges a custom className into the chip's class list", () => {
    const { container } = render(<StatusChip status="vendido" className="custom-mb-2" />);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("custom-mb-2");
  });

  it("(9) 'vendido' chip carries the destructive variant classes (red)", () => {
    const { container } = render(<StatusChip status="vendido" />);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("text-status-destructive");
  });

  it("(10) 'separado' chip carries the warning variant classes (yellow)", () => {
    const { container } = render(<StatusChip status="separado" />);
    const span = container.querySelector("span")!;
    expect(span.className).toContain("text-status-warning");
  });
});
