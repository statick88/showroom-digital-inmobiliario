"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Propiedad } from "@/domain/entities/propiedad";

const ESTADO_CONFIG: Record<Propiedad["estado"], { label: string; color: string }> = {
  disponible: { label: "Disponible", color: "bg-emerald-500" },
  separado: { label: "Separado", color: "bg-amber-500" },
  vendido: { label: "Vendido", color: "bg-red-500" },
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
        {/* Hero */}
        <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden shrink-0 isolate">
          {hasImage ? (
            <Image
              src={propiedad.imagenes[0]!}
              alt={propiedad.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl text-zinc-700">🏗️</span>
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

        {/* Body */}
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

          {/* Specs grid */}
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

          {/* Description */}
          {propiedad.descripcion && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descripción</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {propiedad.descripcion}
              </p>
            </div>
          )}

          {/* Extra images */}
          {propiedad.imagenes.length > 1 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Galería</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {propiedad.imagenes.slice(1).map((url, i) => (
                  <div key={i} className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={url!}
                      alt={`${propiedad.titulo} - ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact button */}
          <Button className="w-full" size="lg" onClick={() => onContact?.(propiedad)}>
            Contactar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
