"use client";

import type { Propiedad } from "@/domain/entities/propiedad";
import { ImageIcon } from "lucide-react";

interface GalleryProps {
  propiedad: Propiedad | null;
}

export function Gallery({ propiedad }: GalleryProps) {
  if (!propiedad || propiedad.imagenes.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">
        <ImageIcon className="mr-1 h-4 w-4" /> Galería
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {propiedad.imagenes.slice(1).map((url, i) => (
          <div key={i} className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden">
            <img
              src={url!}
              alt={`${propiedad.titulo} - ${i + 2}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}