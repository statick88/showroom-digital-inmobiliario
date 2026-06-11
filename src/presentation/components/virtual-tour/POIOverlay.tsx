import { useMemo } from "react";
import { projectToSphere } from "@/presentation/hooks/useParcelProjection";
import { POIMarker } from "./POIMarker";
import type { TourPOI } from "@/domain/entities/tour-poi";

export interface POIOverlayProps {
  pois: TourPOI[];
  panoramaCenter?: { lat: number; lng: number } | null;
  onPOIClick: (poi: TourPOI) => void;
  radius?: number;
}

/**
 * Orchestrates all POI markers inside the R3F Canvas.
 * Renders a POIMarker for each POI at its projected 3D position.
 * Uses frustum culling on the group (same pattern as ParcelOverlay).
 * Gracefully degrades: logs warning and returns null if panoramaCenter is missing.
 */
export function POIOverlay({
  pois,
  panoramaCenter,
  onPOIClick,
  radius = 499,
}: POIOverlayProps) {
  const positions = useMemo(() => {
    const map: Record<string, [number, number, number]> = {};
    if (!panoramaCenter) return map;

    for (const poi of pois) {
      map[poi.id] = projectToSphere(poi.lng, poi.lat, panoramaCenter, radius);
    }
    return map;
  }, [pois, panoramaCenter, radius]);

  if (!panoramaCenter) {
    console.warn(
      "[POIOverlay] panoramaCenter not provided — POI overlays disabled",
    );
    return null;
  }

  if (pois.length === 0) return null;

  return (
    <group frustumCulled>
      {pois.map((poi) => {
        const position = positions[poi.id];
        if (!position) return null;

        return (
          <POIMarker
            key={poi.id}
            poi={poi}
            position={position}
            onClick={onPOIClick}
          />
        );
      })}
    </group>
  );
}
