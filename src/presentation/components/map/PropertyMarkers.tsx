"use client";

import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import type { Propiedad } from "@/domain/entities/propiedad";

const COLORS: Record<Propiedad["estado"], string> = {
  disponible: "#22c55e",
  separado: "#eab308",
  vendido: "#ef4444",
};

const LABELS: Record<Propiedad["estado"], string> = {
  disponible: "Disponible",
  separado: "Separado",
  vendido: "Vendido",
};

function createIcon(estado: Propiedad["estado"]) {
  return divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${COLORS[estado]};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
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
              <div className="font-sans text-sm leading-snug">
                <p className="font-semibold text-base mb-1">{p.titulo}</p>
                <p className="text-zinc-600 mb-1">
                  {p.distrito && `${p.distrito}, `}
                  {p.ciudad}
                </p>
                <p className="font-bold text-lg mb-1">{formatPrice(p.precio, p.moneda)}</p>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: COLORS[p.estado] + "22",
                    color: COLORS[p.estado],
                  }}
                >
                  {LABELS[p.estado]}
                </span>
                <p className="text-zinc-500 mt-1">Código: {p.codigo}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
