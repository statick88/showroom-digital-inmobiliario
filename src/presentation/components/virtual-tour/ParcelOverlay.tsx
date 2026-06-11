"use client";

import { useMemo } from "react";
import { projectToSphere } from "@/presentation/hooks/useParcelProjection";
import { ParcelPolygonMesh } from "./ParcelPolygonMesh";
import { ParcelLabel } from "./ParcelLabel";
import type { Lote } from "@/domain/entities/lote";

export interface ParcelOverlayProps {
  parcels: Lote[];
  panoramaCenter?: { lat: number; lng: number } | null;
  onParcelClick: (lote: Lote) => void;
  radius?: number;
}

/**
 * Orchestrates all parcel meshes and labels inside the R3F Canvas.
 * Renders ParcelPolygonMesh + ParcelLabel for each parcel.
 * Gracefully degrades: logs warning and returns null if panoramaCenter is missing.
 */
export function ParcelOverlay({
  parcels,
  panoramaCenter,
  onParcelClick,
  radius = 499,
}: ParcelOverlayProps) {
  // Precompute label positions (center of each polygon)
  // NOTE: useMemo must be called unconditionally (Rules of Hooks)
  const labelPositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};

    if (!panoramaCenter) return positions;

    for (const parcel of parcels) {
      const coords = parcel.poligonoCoords;
      if (!Array.isArray(coords) || coords.length === 0) continue;

      const ring = coords[0];
      if (!Array.isArray(ring) || ring.length === 0) continue;

      // Average all vertices to get the centroid
      let sumLng = 0;
      let sumLat = 0;
      for (const coord of ring) {
        const lng = coord[0];
        const lat = coord[1];
        if (lng !== undefined && lat !== undefined) {
          sumLng += lng;
          sumLat += lat;
        }
      }
      const centroidLng = sumLng / ring.length;
      const centroidLat = sumLat / ring.length;

      positions[parcel.id] = projectToSphere(
        centroidLng,
        centroidLat,
        panoramaCenter,
        radius
      );
    }

    return positions;
  }, [parcels, panoramaCenter, radius]);

  // Graceful degradation: log warning and return null if panoramaCenter is missing
  if (!panoramaCenter) {
    console.warn(
      "[ParcelOverlay] panoramaCenter not provided — parcel overlays disabled"
    );
    return null;
  }

  return (
    <group>
      {/* Parcel boundary lines */}
      {parcels.map((parcel) => {
        const coords = parcel.poligonoCoords;
        if (!Array.isArray(coords) || coords.length === 0) {
          return null;
        }

        return (
          <ParcelPolygonMesh
            key={`mesh-${parcel.id}`}
            geojson={parcel.poligonoCoords}
            panoramaCenter={panoramaCenter}
            status={parcel.estado}
            radius={radius}
          />
        );
      })}

      {/* Parcel labels with frustum culling */}
      <group frustumCulled>
        {parcels.map((parcel) => {
          const position = labelPositions[parcel.id];
          if (!position) return null;

          return (
            <ParcelLabel
              key={`label-${parcel.id}`}
              lote={parcel}
              position={position}
              onClick={onParcelClick}
            />
          );
        })}
      </group>
    </group>
  );
}
