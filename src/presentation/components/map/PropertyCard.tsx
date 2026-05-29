import { Building } from "lucide-react";
import type { Propiedad } from "@/domain/entities/propiedad";

const ESTADO_STYLES: Record<
  Propiedad["estado"],
  { label: string; bg: string; text: string }
> = {
  disponible: { label: "Disponible", bg: "bg-tertiary/10", text: "text-tertiary" },
  separado: { label: "Separado", bg: "bg-secondary/10", text: "text-secondary" },
  vendido: { label: "Vendido", bg: "bg-error/10", text: "text-error" },
};

function formatPrice(precio: number, moneda: string) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda === "USD" ? "USD" : "PEN",
    maximumFractionDigits: 0,
  }).format(precio);
}

export function PropertyCard({
  propiedad,
  selected,
  onClick,
}: {
  propiedad: Propiedad;
  selected?: boolean;
  onClick?: () => void;
}) {
  const cfg = ESTADO_STYLES[propiedad.estado];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex gap-4 p-3 rounded-xl transition-all duration-200 group cursor-pointer bg-white dark:bg-zinc-900 border ${
        selected
          ? "border-primary shadow-card"
          : "border-transparent hover:border-primary"
      }`}
    >
      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-surface-container">
        {propiedad.imagenes.length > 0 ? (
          <img
            src={propiedad.imagenes[0]!}
            alt={propiedad.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building size={20} className="text-zinc-400" aria-label="Sin imagen" />
          </div>
        )}
        <span
          className={`absolute top-1 right-1 ${cfg.bg} ${cfg.text} text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase`}
        >
          {cfg.label}
        </span>
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-bold text-on-surface text-body-md line-clamp-1">{propiedad.titulo}</h3>
          <p className="text-on-surface-variant text-label-md flex items-center gap-1 mt-1">
            <svg className="size-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5z" />
            </svg>
            {[propiedad.distrito, propiedad.ciudad].filter(Boolean).join(", ")}
          </p>
        </div>
        <p className="font-currency-md text-currency-md text-primary mt-2">
          {formatPrice(propiedad.precio, propiedad.moneda)}
        </p>
      </div>
    </button>
  );
}