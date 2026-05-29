"use client";

import Image from "next/image";
import type { Propiedad } from "@/domain/entities/propiedad";

const ESTADO_STYLES: Record<Propiedad["estado"], { label: string; bg: string; text: string }> = {
  disponible: { label: "Disponible", bg: "bg-emerald-500", text: "text-emerald-600" },
  separado: { label: "Separado", bg: "bg-amber-500", text: "text-amber-600" },
  vendido: { label: "Vendido", bg: "bg-red-500", text: "text-red-600" },
};

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function PropertyCard({
  propiedad,
  selected,
  onClick,
}: {
  propiedad: Propiedad;
  selected?: boolean;
  onClick?: () => void;
}) {
  const cfg = ESTADO_STYLES[propiedad.estado];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex gap-3 p-3 rounded-xl text-left transition-all ring-1 ${
        selected
          ? "ring-primary bg-primary/5"
          : "ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {propiedad.imagenes.length > 0 ? (
          <Image
            src={propiedad.imagenes[0]!}
            alt={propiedad.titulo}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl text-zinc-400">
            🏗️
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{propiedad.titulo}</p>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {propiedad.distrito && `${propiedad.distrito}, `}
          {propiedad.ciudad}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs font-semibold ${cfg.text}`}>
            {formatPrice(propiedad.precio, propiedad.moneda)}
          </span>
          <span
            className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded-full ${cfg.bg}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>
    </button>
  );
}
