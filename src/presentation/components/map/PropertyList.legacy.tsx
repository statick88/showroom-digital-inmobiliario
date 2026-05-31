"use client";

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
        <div
          key={p.id}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            p.id === selectedId
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50"
          }`}
          onClick={() => onSelect?.(p)}
        >
          <p className="font-semibold text-foreground">{p.titulo}</p>
          <p className="text-sm text-muted-foreground">{p.distrito}</p>
        </div>
      ))}
    </div>
  );
}
