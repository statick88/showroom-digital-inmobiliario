import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useLotes, useLotesPorVendedor } from "@/presentation/hooks/useLotes";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import { useProyecto } from "@/presentation/hooks/useProyectos";
import { env } from "@/config/env";
import { getPolygonStyle } from "@/config/polygon-styles";
import type { Feature, Polygon } from "geojson";
import type { Lote, EstadoLote } from "@/domain/entities/lote";
import { GlassControls } from "@/presentation/components/map/GlassControls";
import { MasterPlanOverlay } from "@/presentation/components/map/MasterPlanOverlay";
import { isValidLatLng } from "@/presentation/components/map/map-utils";

const DEFAULT_CENTER: [number, number] = [-13.163, -74.224];

function MapController({ centro }: { centro: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(centro, map.getZoom());
  }, [centro, map]);

  return null;
}

interface MapaLotesProps {
  onLoteClick: (lote: Lote) => void;
  filtroEstado?: EstadoLote;
  /**
   * T-4.3: when true, the map calls `useLotesPorVendedor` (scoped to
   * the signed-in seller's project) instead of the default `useLotes`.
   */
  modoVendedor?: boolean;
}

/**
 * Converts GeoJSON coordinates from [lng, lat] (database) to [lat, lng] (Leaflet)
 * and validates the coordinate structure.
 */
function convertCoordinatesToLatLng(coords: unknown): number[][][] | null {
  if (!coords || !Array.isArray(coords)) return null;

  try {
    // GeoJSON Polygon coordinates: [[[lng, lat], [lng, lat], ...]]
    // Leaflet expects: [[[lat, lng], [lat, lng], ...]]
    const rings = coords as number[][][];

    return rings
      .map((ring) =>
        ring
          .map((coord) => {
            if (!Array.isArray(coord) || coord.length < 2) return null;
            // Database stores [lng, lat], Leaflet expects [lat, lng]
            const [lng, lat] = coord;
            if (
              typeof lat !== "number" ||
              typeof lng !== "number" ||
              !Number.isFinite(lat) ||
              !Number.isFinite(lng)
            ) {
              return null;
            }
            return [lat, lng];
          })
          .filter((c): c is [number, number] => c !== null),
      )
      .filter((ring) => ring.length >= 4); // Valid polygon needs at least 4 points (closed)
  } catch {
    return null;
  }
}

export function MapaLotes({ onLoteClick, filtroEstado, modoVendedor }: MapaLotesProps) {
  const proyectoId = env.proyectoId;
  const authUserId = useAuthStore((s) => s.id);

  // T-4.3: pick the right hook based on `modoVendedor`. Both hooks
  // are unconditional (React's rules of hooks require the same
  // number of hooks on every render), so we always call BOTH and
  // pick the result.
  const defaultQuery = useLotes(proyectoId, filtroEstado ? { estado: filtroEstado } : undefined);
  const vendedorQuery = useLotesPorVendedor(
    authUserId ?? "",
    filtroEstado ? { estado: filtroEstado } : undefined,
  );
  const { data: lotes, isLoading } = modoVendedor ? vendedorQuery : defaultQuery;
  const { data: proyecto } = useProyecto(proyectoId);

  const center: [number, number] = isValidLatLng(proyecto?.coordenadasCentro)
    ? [proyecto.coordenadasCentro.lat, proyecto.coordenadasCentro.lng]
    : DEFAULT_CENTER;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="typo-body-md text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  // Filter out lotes with invalid coordinates and convert to Leaflet format
  const validLotes = (lotes ?? [])
    .map((lote) => {
      const convertedCoords = convertCoordinatesToLatLng(lote.poligonoCoords);
      return convertedCoords ? { lote, poligonoCoords: convertedCoords } : null;
    })
    .filter((l): l is { lote: Lote; poligonoCoords: number[][][] } => l !== null);

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={17} className="h-full w-full z-0" zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController centro={center} />
        <MasterPlanOverlay />
        {validLotes.map(({ lote, poligonoCoords }) => (
          <GeoJSON
            key={lote.id}
            data={
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: poligonoCoords,
                },
                properties: null,
              } as Feature<Polygon>
            }
            style={() => getPolygonStyle(lote.estado)}
            eventHandlers={{
              click: () => onLoteClick(lote),
            }}
          />
        ))}
      </MapContainer>
      <GlassControls />
    </div>
  );
}
