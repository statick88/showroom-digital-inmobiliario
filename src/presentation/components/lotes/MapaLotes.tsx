"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useLotes } from "@/presentation/hooks/useLotes";
import { useProyecto } from "@/presentation/hooks/useProyectos";
import { env } from "@/config/env";
import { getPolygonStyle } from "@/config/polygon-styles";
import type { Lote, EstadoLote } from "@/domain/entities/lote";
import { GlassControls } from "@/presentation/components/map/GlassControls";
import { MasterPlanOverlay } from "@/presentation/components/map/MasterPlanOverlay";

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
  modoVendedor?: boolean;
}

export function MapaLotes({ onLoteClick, filtroEstado }: MapaLotesProps) {
  const proyectoId = env.proyectoId;
  const { data: lotes, isLoading } = useLotes(proyectoId, filtroEstado ? { estado: filtroEstado } : undefined);
  const { data: proyecto } = useProyecto(proyectoId);

  const center: [number, number] = proyecto?.coordenadasCentro
    ? [proyecto.coordenadasCentro.lat, proyecto.coordenadasCentro.lng]
    : DEFAULT_CENTER;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="typo-body-md text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={17}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController centro={center} />
        <MasterPlanOverlay />
        {lotes?.map((lote) => (
          <GeoJSON
            key={lote.id}
            data={
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: lote.poligonoCoords,
                },
              } as any
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
