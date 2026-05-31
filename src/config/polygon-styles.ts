import type { PathOptions } from "leaflet";
import type { EstadoLote } from "@/domain/entities/lote";

export const POLYGON_COLORS: Record<EstadoLote, PathOptions> = {
  disponible: { fillColor: "var(--status-success)", color: "#166534", fillOpacity: 0.3, weight: 2 },
  reservado: { fillColor: "var(--status-warning)", color: "#854d0e", fillOpacity: 0.3, weight: 2 },
  vendido: { fillColor: "var(--status-destructive)", color: "#991b1b", fillOpacity: 0.3, weight: 2 },
};

export function getPolygonStyle(estado: EstadoLote) {
  return POLYGON_COLORS[estado] ?? POLYGON_COLORS.disponible;
}
