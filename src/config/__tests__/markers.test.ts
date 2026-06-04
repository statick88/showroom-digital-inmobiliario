import { describe, it, expect } from "vitest";

import {
  getMarkerColor,
  createMarkerHtml,
  MARKER_SIZE,
  MARKER_BORDER_WIDTH,
  MARKER_BORDER_COLOR,
} from "@/config/markers";

describe("config/markers — getMarkerColor / createMarkerHtml", () => {
  describe("getMarkerColor", () => {
    it("(1) returns the warning color for 'separado'", () => {
      expect(getMarkerColor("separado")).toBe("var(--status-warning, #EAB308)");
    });

    it("(2) returns the destructive color for 'vendido'", () => {
      expect(getMarkerColor("vendido")).toBe("var(--status-destructive, #EF4444)");
    });

    it("(3) returns the success color for 'disponible' (default branch)", () => {
      expect(getMarkerColor("disponible")).toBe("var(--status-success, #22C55E)");
    });

    it("(4) returns the success color for unknown / non-mapped statuses (defensive default)", () => {
      // Any state not explicitly mapped falls through to the default branch
      expect(getMarkerColor("reservado")).toBe("var(--status-success, #22C55E)");
      expect(getMarkerColor("unknown-state")).toBe("var(--status-success, #22C55E)");
      expect(getMarkerColor("")).toBe("var(--status-success, #22C55E)");
    });
  });

  describe("createMarkerHtml", () => {
    it("(5) returns an HTML div with width/height matching MARKER_SIZE and a circle border-radius", () => {
      const html = createMarkerHtml("disponible");
      // We assert the structural pieces — not the exact string (which is brittle)
      expect(html).toContain("border-radius: 50%");
      expect(html).toContain(`width: ${MARKER_SIZE}px`);
      expect(html).toContain(`height: ${MARKER_SIZE}px`);
    });

    it("(6) embeds the border width and border color from the constants", () => {
      const html = createMarkerHtml("vendido");
      expect(html).toContain(`border: ${MARKER_BORDER_WIDTH}px solid ${MARKER_BORDER_COLOR}`);
    });

    it("(7) embeds the correct background color for each mapped estado", () => {
      expect(createMarkerHtml("disponible")).toContain("var(--status-success, #22C55E)");
      expect(createMarkerHtml("separado")).toContain("var(--status-warning, #EAB308)");
      expect(createMarkerHtml("vendido")).toContain("var(--status-destructive, #EF4444)");
    });

    it("(8) embeds a box-shadow for visual lift", () => {
      const html = createMarkerHtml("disponible");
      expect(html).toContain("box-shadow:");
    });
  });

  describe("constants", () => {
    it("(9) exposes MARKER_SIZE, MARKER_BORDER_WIDTH, MARKER_BORDER_COLOR as the documented values", () => {
      expect(MARKER_SIZE).toBe(16);
      expect(MARKER_BORDER_WIDTH).toBe(2);
      expect(MARKER_BORDER_COLOR).toBe("#ffffff");
    });
  });
});
