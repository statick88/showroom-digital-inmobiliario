"use client";

import type { Propiedad } from "@/domain/entities/propiedad";
import { Ruler, Bed, Bath } from "lucide-react";

interface SpecsGridProps {
  propiedad: Propiedad | null;
}

export function SpecsGrid({ propiedad }: SpecsGridProps) {
  if (!propiedad) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {propiedad.areaM2 && (
        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <Ruler className="h-5 w-5 text-zinc-500 mb-1" />
          <p className="text-sm font-medium">{propiedad.areaM2}</p>
          <p className="text-xs text-zinc-500">m²</p>
        </div>
      )}
      {propiedad.cuartos && (
        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <Bed className="h-5 w-5 text-zinc-500 mb-1" />
          <p className="text-sm font-medium">{propiedad.cuartos}</p>
          <p className="text-xs text-zinc-500">Dorm.</p>
        </div>
      )}
      {propiedad.banios && (
        <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
          <Bath className="h-5 w-5 text-zinc-500 mb-1" />
          <p className="text-sm font-medium">{propiedad.banios}</p>
          <p className="text-xs text-zinc-500">Baños</p>
        </div>
      )}
    </div>
  );
}