import type { POIType } from "@/domain/entities/tour-poi";

/**
 * Emoji icon mapping for POI types.
 * Used by POIMarker to render the correct icon per POI category.
 */
export const POI_ICONS: Record<POIType, string> = {
  amenity: "🏢",
  road: "🛣️",
  attraction: "🎯",
  landmark: "🏛️",
  other: "📍",
};

/**
 * Badge background/text colors for POI type labels (drei <Html>).
 * Lighter variants for readability on DOM badges.
 */
export const POI_COLORS: Record<POIType, { bg: string; text: string }> = {
  amenity: { bg: "#dbeafe", text: "#1e40af" }, // blue
  road: { bg: "#e0e7ff", text: "#3730a3" }, // indigo
  attraction: { bg: "#fef3c7", text: "#92400e" }, // amber
  landmark: { bg: "#ede9fe", text: "#5b21b6" }, // violet
  other: { bg: "#f3f4f6", text: "#374151" }, // gray
};
