import type { EstadoLote } from "@/domain/entities/lote";

/**
 * R3F-compatible color mapping for parcel status.
 * Used by ParcelPolygonMesh and ParcelLabel in the virtual tour overlay.
 */
export const PARCEL_COLORS: Record<EstadoLote, string> = {
  disponible: "#166534", // green-700
  reservado: "#854d0e", // yellow-800
  vendido: "#991b1b", // red-800
};

/**
 * Badge background/text colors for parcel labels (drei <Html>).
 * Lighter variants for readability on DOM badges.
 */
export const PARCEL_BADGE_COLORS: Record<EstadoLote, { bg: string; text: string }> = {
  disponible: { bg: "#dcfce7", text: "#166534" },
  reservado: { bg: "#fef9c3", text: "#854d0e" },
  vendido: { bg: "#fee2e2", text: "#991b1b" },
};
