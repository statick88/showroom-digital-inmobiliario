"use client";

import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Propiedad } from "@/domain/entities/propiedad";
import { getMarkerColor, getMarkerHtml } from "@/config/markers";
import { MarkerPopup } from "./MarkerPopup";

function createIcon(estado: Propiedad["estado"]) {
  return divIcon({
    className: "",
    html: getMarkerHtml(estado),
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function PropertyMarkers({
  propiedades,
  onSelect,
}: {
  propiedades: Propiedad[];
  onSelect?: (propiedad: Propiedad) => void;
}) {
  return (
    <>
      {propiedades.map((p) => {
        if (!p.ubicacion) return null;
        return (
          <Marker
            key={p.id}
            position={[p.ubicacion.y, p.ubicacion.x]}
            icon={createIcon(p.estado)}
            eventHandlers={onSelect ? { click: () => onSelect(p) } : undefined}
          >
            <Popup>
              <MarkerPopup propiedad={p} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
