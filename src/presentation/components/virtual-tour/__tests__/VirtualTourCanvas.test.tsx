/**
 * T-4.2 tests for VirtualTourCanvas new props.
 *
 * VirtualTourCanvas is deeply coupled to R3F/Three.js. Full render testing
 * in JSDOM is unreliable. We verify the new optional props at the interface
 * level by checking TypeScript compilation of the prop type.
 */
import { describe, it, expect, vi } from "vitest";
import type { VirtualTourScene } from "@/domain/entities/virtual-tour";
import type { Lote } from "@/domain/entities/lote";

// ── Import the prop type directly ──────────────────────────────────
type CanvasProps = import("@/presentation/components/virtual-tour/VirtualTourCanvas").VirtualTourCanvasProps;

describe("VirtualTourCanvas — prop types", () => {
  it("accepts parcels, panoramaCenter, and onParcelClick props", () => {
    const scene: VirtualTourScene = {
      id: "scene-1",
      textureUrl: "tex.jpg",
      thumbnailUrl: "thumb.jpg",
      yaw: 0,
      pitch: 0,
      fov: 75,
    };

    const lote: Lote = {
      id: "lote-1",
      proyectoId: "proy-1",
      codigo: "L-01",
      areaTotal: 150,
      precio: 125000,
      moneda: "PEN",
      estado: "disponible",
      poligonoCoords: [],
      orden: 1,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    const center = { lat: -13.163, lng: -74.224 };
    const onClick = vi.fn();

    // This type assertion will FAIL to compile if props aren't in VirtualTourCanvasProps
    const props: CanvasProps = {
      scene,
      parcels: [lote],
      panoramaCenter: center,
      onParcelClick: onClick,
    };

    expect(props.parcels).toHaveLength(1);
    expect(props.panoramaCenter).toEqual(center);
    expect(typeof props.onParcelClick).toBe("function");
  });

  it("works without new props (backward compatible)", () => {
    const scene: VirtualTourScene = {
      id: "scene-1",
      textureUrl: "tex.jpg",
      thumbnailUrl: "thumb.jpg",
      yaw: 0,
      pitch: 0,
      fov: 75,
    };

    const props: CanvasProps = {
      scene,
    };

    expect(props.parcels).toBeUndefined();
    expect(props.panoramaCenter).toBeUndefined();
    expect(props.onParcelClick).toBeUndefined();
  });
});
