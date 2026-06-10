"use client";

import { Html } from "@react-three/drei";
import { POI_ICONS, POI_COLORS } from "@/config/poi-icons";
import type { TourPOI } from "@/domain/entities/tour-poi";

export interface POIMarkerProps {
  poi: TourPOI;
  position: [number, number, number];
  onClick: (poi: TourPOI) => void;
}

/**
 * Renders a single POI hotspot inside the R3F Canvas.
 * Uses drei <Html> with distanceFactor for consistent sizing.
 * Displays an emoji icon (from poi-icons.ts) and a text label.
 * Touch target meets 44×44px minimum for mobile accessibility.
 */
export function POIMarker({ poi, position, onClick }: POIMarkerProps) {
  const icon = POI_ICONS[poi.poi_type] ?? "📍";
  const colors = POI_COLORS[poi.poi_type] ?? POI_COLORS.other;

  return (
    <Html position={position} distanceFactor={10} zIndexRange={[10, 0]}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(poi);
        }}
        className="flex flex-col items-center gap-0.5 cursor-pointer select-none"
        style={{ minWidth: 44, minHeight: 44 }}
        aria-label={`POI ${poi.name} - ${poi.poi_type}`}
      >
        {/* Icon badge */}
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full text-base shadow-md pointer-events-none"
          style={{ backgroundColor: colors.bg }}
          aria-hidden="true"
        >
          {icon}
        </span>

        {/* Label */}
        <span
          className="px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap shadow-md pointer-events-none max-w-[120px] truncate"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {poi.name}
        </span>
      </button>
    </Html>
  );
}
