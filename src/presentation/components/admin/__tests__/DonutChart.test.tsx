import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { DonutChart } from "@/presentation/components/admin/DonutChart";

describe("DonutChart", () => {
  it("(1) renders the total count in the center of the donut", () => {
    const { getByText } = render(
      <DonutChart disponibles={5} separadas={2} vendidas={3} total={10} />,
    );
    expect(getByText("10")).toBeInTheDocument();
  });

  it("(2) renders each segment label with its value and percentage (total > 0 branch)", () => {
    const { getByText } = render(
      <DonutChart disponibles={5} separadas={2} vendidas={3} total={10} />,
    );
    expect(getByText("Disponible")).toBeInTheDocument();
    expect(getByText("5 (50%)")).toBeInTheDocument();
    expect(getByText("Separado")).toBeInTheDocument();
    expect(getByText("2 (20%)")).toBeInTheDocument();
    expect(getByText("Vendido")).toBeInTheDocument();
    expect(getByText("3 (30%)")).toBeInTheDocument();
  });

  it("(3) renders '0%' for every segment when total is 0 (total === 0 branch)", () => {
    const { getAllByText } = render(
      <DonutChart disponibles={0} separadas={0} vendidas={0} total={0} />,
    );
    const zeroPcts = getAllByText("0 (0%)");
    expect(zeroPcts).toHaveLength(3);
  });

  it("(4) rounds fractional percentages to whole numbers (toFixed(0))", () => {
    // 1/3 ≈ 33.33% → "33%"
    const { container } = render(
      <DonutChart disponibles={1} separadas={1} vendidas={1} total={3} />,
    );
    // The number "33" should appear as the rounded percentage for each segment
    const text = container.textContent ?? "";
    expect(text).toMatch(/1 \(33%\)/);
    expect((text.match(/33%/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
