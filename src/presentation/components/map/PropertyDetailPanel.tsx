import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, ChevronLeft } from "lucide-react";
import { HeroImage } from "./HeroImage";
import { SpecsGrid } from "./SpecsGrid";
import { Gallery } from "./Gallery";
import type { Propiedad } from "@/domain/entities/propiedad";

const ESTADO_CONFIG: Record<Propiedad["estado"], { label: string; color: string }> = {
  disponible: { label: "Disponible", color: "bg-status-success" },
  separado: { label: "Separado", color: "bg-status-warning" },
  vendido: { label: "Vendido", color: "bg-status-destructive" },
};

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function PropertyDetailPanel({
  propiedad,
  open,
  onClose,
  onContact,
}: {
  propiedad: Propiedad | null;
  open: boolean;
  onClose: () => void;
  onContact?: (propiedad: Propiedad) => void;
}) {
  if (!propiedad) return null;

  const cfg = ESTADO_CONFIG[propiedad.estado];
  const hasImage = propiedad.imagenes.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden shrink-0 isolate">
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
          <div className="absolute top-3 left-3">
            <Badge className={`${cfg.color} text-white border-none`}>{cfg.label}</Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-xl drop-shadow-sm">
              {formatPrice(propiedad.precio, propiedad.moneda)}
            </p>
            <p className="text-white/80 text-xs">{propiedad.codigo}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <DialogTitle className="text-lg font-semibold leading-snug">
              {propiedad.titulo}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 mt-0.5">
              {propiedad.distrito && `${propiedad.distrito}, `}
              {propiedad.ciudad}, Perú
            </DialogDescription>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {propiedad.areaM2 && (
              <div className="text-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-lg font-bold">{propiedad.areaM2}</p>
                <p className="text-xs text-zinc-500">m²</p>
              </div>
            )}
            {propiedad.cuartos && (
              <div className="text-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-lg font-bold">{propiedad.cuartos}</p>
                <p className="text-xs text-zinc-500">Dorm.</p>
              </div>
            )}
            {propiedad.banios && (
              <div className="text-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <p className="text-lg font-bold">{propiedad.banios}</p>
                <p className="text-xs text-zinc-500">Baños</p>
              </div>
            )}
          </div>

          {propiedad.descripcion && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descripción</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {propiedad.descripcion}
              </p>
            </div>
          )}

          {propiedad.imagenes.length > 1 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Galería</h4>
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
          )}

          <Button className="w-full" size="lg" onClick={() => onContact?.(propiedad)}>
            Contactar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
