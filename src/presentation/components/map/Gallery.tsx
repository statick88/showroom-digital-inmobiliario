import type { Propiedad } from "@/domain/entities/propiedad";
import { ImageIcon } from "lucide-react";

interface GalleryProps {
  propiedad: Propiedad | null;
}

export function Gallery({ propiedad }: GalleryProps) {
  if (!propiedad || propiedad.imagenes.length <= 1) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <ImageIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Galería</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {propiedad.imagenes.slice(1).map((url, i) => (
          <img
            key={i}
            src={url!}
            alt={`${propiedad.titulo} - ${i + 2}`}
            className="w-[112px] h-20 object-cover rounded-lg shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
