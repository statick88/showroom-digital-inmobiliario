"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface GaleriaProyectoProps {
  imagenes: string[];
  titulo?: string;
}

export function GaleriaProyecto({ imagenes, titulo }: GaleriaProyectoProps) {
  const [selected, setSelected] = useState(0);

  if (imagenes.length === 0) return null;

  return (
    <div className="space-y-4">
      {titulo && (
        <h2 className="typo-headline-md text-foreground">{titulo}</h2>
      )}
      <div className="relative rounded-xl overflow-hidden border border-border h-[400px]">
        <img
          src={imagenes[selected]}
          alt={`${titulo ?? "Imagen"} ${selected + 1}`}
          className="w-full h-full object-cover"
        />
        {imagenes.length > 1 && (
          <>
            <button
              onClick={() => setSelected((p) => (p - 1 + imagenes.length) % imagenes.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors shadow"
            >
              <Icon name="chevron_left" size={24} />
            </button>
            <button
              onClick={() => setSelected((p) => (p + 1) % imagenes.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors shadow"
            >
              <Icon name="chevron_right" size={24} />
            </button>
          </>
        )}
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                i === selected ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
