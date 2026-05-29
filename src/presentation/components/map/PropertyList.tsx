"use client";

import { PropertyCard } from "./PropertyCard";
import type { Propiedad } from "@/domain/entities/propiedad";

export function PropertyList({
  propiedades,
  isLoading,
  selectedId,
  onSelect,
}: {
  propiedades?: Propiedad[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (propiedad: Propiedad) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
        Cargando propiedades...
      </div>
    );
  }

  if (!propiedades?.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
        No hay propiedades disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {propiedades.map((p) => (
        <PropertyCard
          key={p.id}
          propiedad={p}
          selected={p.id === selectedId}
          onClick={() => onSelect?.(p)}
        />
      ))}
    </div>
  );
}