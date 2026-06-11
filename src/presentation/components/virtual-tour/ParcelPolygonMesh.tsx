import { useMemo } from "react";
import * as THREE from "three";
import { projectToSphere } from "@/presentation/hooks/useParcelProjection";
import { PARCEL_COLORS } from "@/config/parcel-colors";
import type { EstadoLote } from "@/domain/entities/lote";

export interface ParcelPolygonMeshProps {
  geojson: number[][][];
  panoramaCenter: { lat: number; lng: number };
  status: EstadoLote;
  radius?: number;
}

/**
 * Renders a single parcel boundary as THREE.LineSegments inside the R3F Canvas.
 * Projects GeoJSON polygon coordinates to sphere positions relative to panoramaCenter.
 * Lines render at radius 499 (inside the 500-radius texture sphere).
 */
export function ParcelPolygonMesh({
  geojson,
  panoramaCenter,
  status,
  radius = 499,
}: ParcelPolygonMeshProps) {
  const lineSegments = useMemo(() => {
    const positions: number[] = [];

    if (!Array.isArray(geojson)) return new THREE.BufferGeometry();

    for (const ring of geojson) {
      if (!Array.isArray(ring) || ring.length < 2) continue;

      const projected: [number, number, number][] = ring
        .filter((coord: number[]) => coord.length >= 2)
        .map((coord: number[]) =>
          projectToSphere(coord[0]!, coord[1]!, panoramaCenter, radius)
        );

      // Create line segments: pairs of vertices
      for (let i = 0; i < projected.length - 1; i++) {
        const seg = projected[i];
        const next = projected[i + 1];
        if (!seg || !next) continue;
        const [x1, y1, z1] = seg;
        const [x2, y2, z2] = next;
        positions.push(x1, y1, z1, x2, y2, z2);
      }

      // Close the ring: connect last vertex back to first
      if (projected.length > 2) {
        const first = projected[0];
        const last = projected[projected.length - 1];
        if (first && last) {
          const [x1, y1, z1] = last;
          const [x2, y2, z2] = first;
          positions.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geometry;
  }, [geojson, panoramaCenter, radius]);

  const color = PARCEL_COLORS[status] ?? PARCEL_COLORS.disponible;

  return (
    <lineSegments geometry={lineSegments}>
      <lineBasicMaterial color={color} linewidth={1} />
    </lineSegments>
  );
}
