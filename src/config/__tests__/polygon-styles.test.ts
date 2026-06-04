import { describe, it, expect } from "vitest";

import { POLYGON_COLORS, getPolygonStyle } from "@/config/polygon-styles";

describe("config/polygon-styles — POLYGON_COLORS / getPolygonStyle", () => {
  it("(1) POLYGON_COLORS has a PathOptions entry for every EstadoLote value (disponible, reservado, vendido)", () => {
    expect(POLYGON_COLORS.disponible).toBeDefined();
    expect(POLYGON_COLORS.reservado).toBeDefined();
    expect(POLYGON_COLORS.vendido).toBeDefined();
  });

  it("(2) POLYGON_COLORS.disponible uses the success fillColor", () => {
    expect(POLYGON_COLORS.disponible.fillColor).toBe("var(--status-success)");
  });

  it("(3) POLYGON_COLORS.reservado uses the warning fillColor", () => {
    expect(POLYGON_COLORS.reservado.fillColor).toBe("var(--status-warning)");
  });

  it("(4) POLYGON_COLORS.vendido uses the destructive fillColor", () => {
    expect(POLYGON_COLORS.vendido.fillColor).toBe("var(--status-destructive)");
  });

  it("(5) all entries share the same fillOpacity (0.3) and weight (2)", () => {
    for (const estado of ["disponible", "reservado", "vendido"] as const) {
      expect(POLYGON_COLORS[estado].fillOpacity).toBe(0.3);
      expect(POLYGON_COLORS[estado].weight).toBe(2);
    }
  });

  it("(6) getPolygonStyle('disponible') returns the matching entry from POLYGON_COLORS", () => {
    expect(getPolygonStyle("disponible")).toBe(POLYGON_COLORS.disponible);
  });

  it("(7) getPolygonStyle('reservado') returns the matching entry from POLYGON_COLORS", () => {
    expect(getPolygonStyle("reservado")).toBe(POLYGON_COLORS.reservado);
  });

  it("(8) getPolygonStyle('vendido') returns the matching entry from POLYGON_COLORS", () => {
    expect(getPolygonStyle("vendido")).toBe(POLYGON_COLORS.vendido);
  });

  it("(9) getPolygonStyle falls back to POLYGON_COLORS.disponible for an unknown estado (?? fallback)", () => {
    // Cast to any to simulate a runtime estado that isn't in the type
    expect(getPolygonStyle("desconocido" as unknown as "disponible")).toBe(
      POLYGON_COLORS.disponible,
    );
    expect(getPolygonStyle("" as unknown as "disponible")).toBe(POLYGON_COLORS.disponible);
  });
});
