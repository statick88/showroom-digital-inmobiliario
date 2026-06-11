"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Icon as LucideIcon } from "@/components/ui/icon";

// Fix Leaflet default marker icons with Vite base path
const defaultIcon = new Icon({
  iconUrl: `${import.meta.env.BASE_URL}marker-icon.png`,
  iconRetinaUrl: `${import.meta.env.BASE_URL}marker-icon-2x.png`,
  shadowUrl: `${import.meta.env.BASE_URL}marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface UbicacionMapaProps {
  lat: number;
  lng: number;
  nombre?: string;
  direccion?: string;
  zoom?: number;
  compact?: boolean;
}

export function UbicacionMapa({
  lat,
  lng,
  nombre,
  direccion,
  zoom = 15,
  compact = false,
}: UbicacionMapaProps) {
  return (
    <div
      className={`rounded-xl overflow-hidden border border-border ${
        compact ? "h-[200px]" : "h-[400px]"
      }`}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={!compact}
        scrollWheelZoom={false}
        attributionControl={!compact}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">{nombre ?? "Proyecto"}</p>
              {direccion && <p className="text-sm text-muted-foreground">{direccion}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
