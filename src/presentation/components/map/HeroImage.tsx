"use client";

import type { Propiedad } from "@/domain/entities/propiedad";
import { Building } from "lucide-react";
import { formatPrice } from "@/presentation/lib/formatters";

interface HeroImageProps {
  propiedad: Propiedad | null;
}

export function HeroImage({ propiedad }: HeroImageProps) {
  if (!propiedad) return null;

  const hasImage = propiedad.imagenes.length > 0;

  return (
    <div className="relative h-[192px] w-full bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden shrink-0 isolate">
      {hasImage ? (
        <img
          src={propiedad.imagenes[0]!}
          alt={propiedad.titulo}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Building size={40} className="text-zinc-700" aria-label="Sin imagen" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white">
        <p className="font-bold text-xl drop-shadow-sm">
          {formatPrice(propiedad.precio, propiedad.moneda)}
        </p>
        <p className="text-white/80 text-xs">{propiedad.codigo}</p>
      </div>
      <div className="absolute top-3 left-3">
        {/* Badge will be injected by parent */}
      </div>
    </div>
  );
}