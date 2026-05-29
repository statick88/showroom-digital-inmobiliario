"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Propiedad } from "@/domain/entities/propiedad";

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

const ESTADO_CONFIG: Record<
  Propiedad["estado"],
  { label: string; color: string; bg: string }
> = {
  disponible: { label: "Disponible", color: "text-tertiary", bg: "bg-tertiary/10" },
  separado: { label: "Separado", color: "text-secondary", bg: "bg-secondary/10" },
  vendido: { label: "Vendido", color: "text-error", bg: "bg-error/10" },
};

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
    <div
      className={`fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-zinc-900 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-72 shrink-0">
          {hasImage ? (
            <img
              src={propiedad.imagenes[0]!}
              alt={propiedad.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-high" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>

          {/* Badge Estado */}
          <div className="absolute top-4 left-4">
            <span className={`${cfg.bg} ${cfg.color} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
              {cfg.label}
            </span>
          </div>

          {/* Info inferior */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div className="text-white">
              <p className="text-xs opacity-80 mb-1">CÓDIGO: {propiedad.codigo}</p>
              <h2 className="font-display text-headline-md leading-tight">{propiedad.titulo}</h2>
            </div>
            <div className="text-right text-white">
              <p className="font-currency-md text-headline-md text-tertiary-fixed">
                {formatPrice(propiedad.precio, propiedad.moneda)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* Ubicación */}
          <div className="flex items-start gap-2">
            <svg className="size-5 text-primary mt-0.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5z" />
            </svg>
            <div>
              <p className="text-body-md font-bold text-on-surface">
                {[propiedad.distrito, propiedad.ciudad].filter(Boolean).join(", ")}
              </p>
              <p className="text-label-md text-on-surface-variant">{propiedad.direccion}</p>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            {propiedad.areaM2 && (
              <div className="flex flex-col items-center gap-1">
                <svg className="size-5 text-primary-container" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                </svg>
                <span className="text-label-md text-on-surface-variant">Área</span>
                <span className="text-body-md font-bold text-on-surface">{propiedad.areaM2} m²</span>
              </div>
            )}
            {propiedad.cuartos && (
              <div className="flex flex-col items-center gap-1 border-x border-outline-variant">
                <svg className="size-5 text-primary-container" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7 13c1.1 0 2-.9 2-2S8.1 9 7 9 5 9.9 5 11s.9 2 2 2zm0 1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm7 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                <span className="text-label-md text-on-surface-variant">Dorm.</span>
                <span className="text-body-md font-bold text-on-surface">{propiedad.cuartos}</span>
              </div>
            )}
            {propiedad.banios && (
              <div className="flex flex-col items-center gap-1">
                <svg className="size-5 text-primary-container" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22 10V4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 .55.45 1 1 1v12c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V11c.55 0 1-.45 1-1zm-2 0H4V4h16v6z" />
                </svg>
                <span className="text-label-md text-on-surface-variant">Baños</span>
                <span className="text-body-md font-bold text-on-surface">{propiedad.banios}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {propiedad.descripcion && (
            <div className="space-y-3">
              <h3 className="font-headline-md text-on-surface">Descripción</h3>
              <p className="text-on-surface-variant text-label-md leading-relaxed">
                {propiedad.descripcion}
              </p>
            </div>
          )}
        </div>

        {/* CTA Sticky */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-outline-variant">
          <button
            onClick={() => onContact?.(propiedad)}
            className="w-full h-12 bg-primary text-white font-bold rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            Contactar
          </button>
        </div>
      </div>
    </div>
  );
}