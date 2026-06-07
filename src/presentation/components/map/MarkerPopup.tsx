"use client";

import type { Propiedad } from "@/domain/entities/propiedad";
import { formatPrice } from "@/presentation/lib/formatters";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { getPublicAssetPath } from "@/presentation/components/map/map-utils";

interface MarkerPopupProps {
  propiedad: Propiedad;
}

export function MarkerPopup({ propiedad }: MarkerPopupProps) {
  return (
    <div className="font-sans text-sm leading-snug min-w-[200px]">
      <div className="flex items-start gap-3">
        <img
          src={propiedad.imagenes[0] ?? getPublicAssetPath("placeholder.svg")}
          alt={propiedad.titulo}
          className="w-20 h-20 object-cover rounded-lg shrink-0"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold mb-1 truncate">{propiedad.titulo}</p>
          <p className="text-zinc-600 dark:text-zinc-400 mb-1 text-xs">
            {propiedad.distrito && `${propiedad.distrito}, `}
            {propiedad.ciudad}
          </p>
          <p className="text-lg font-bold mb-1">
            {formatPrice(propiedad.precio, propiedad.moneda)}
          </p>
          <StatusChip status={propiedad.estado} size="sm" />
        </div>
      </div>
      <div className="mt-2">
        <Button size="sm" className="w-full text-xs">
          Ver detalle
        </Button>
      </div>
    </div>
  );
}
