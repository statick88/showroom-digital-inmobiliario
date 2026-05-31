"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "@/components/ui/icon";

interface UbicacionMapaProps {
  lat: number;
  lng: number;
  nombre?: string;
  direccion?: string;
}

export function UbicacionMapa({ lat, lng, nombre, direccion }: UbicacionMapaProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border h-[400px]">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
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
