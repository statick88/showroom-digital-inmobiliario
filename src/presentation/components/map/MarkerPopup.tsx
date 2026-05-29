"use client";

import type { Propiedad } from "@/domain/entities/propiedad";
import { formatPrice } from "@/presentation/lib/formatters";

interface MarkerPopupProps {
  propiedad: Propiedad;
}

export function MarkerPopup({ propiedad }: MarkerPopupProps) {
  return (
    <div className="font-sans text-sm leading-snug min-w-[200px]">
      <div className="flex items-start gap-3">
        <div className="relative h-24 w-28 shrink-0 rounded-lg overflow-hidden">
          <img
            src={propiedad.imagenes[0]!}
            alt={propiedad.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-base mb-1">{propiedad.titulo}</p>
          <p className="text-zinc-600 mb-1">
            {propiedad.distrito && `${propiedad.distrito}, `}
            {propiedad.ciudad}
          </p>
          <p className="font-bold text-lg mb-1">{formatPrice(propiedad.precio, propiedad.moneda)}</p>
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: getMarkerColor(propiedad.estado) + "22",
              color: getMarkerColor(propiedad.estado),
            }}
          >
            {getEstadoLabel(propiedad.estado)}
          </span>
          <p className="text-zinc-500 mt-1 text-xs">Código: {propiedad.codigo}</p>
        </div>
      </div>
    </div>
  );
}

function getMarkerColor(estado: Propiedad["estado"]): string {
  switch (estado) {
    case "separado":
      return "var(--status-warning, #EAB308)";
    case "vendido":
      return "var(--status-destructive, #EF4444)";
    default:
      return "var(--status-success, #22C55E)";
  }
}

function getEstadoLabel(estado: Propiedad["estado"]): string {
  switch (estado) {
    case "disponible":
      return "Disponible";
    case "separado":
      return "Separado";
    case "vendido":
      return "Vendido";
    default:
      return estado;
  }
}