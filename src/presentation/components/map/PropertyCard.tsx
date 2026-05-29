import { Building } from "lucide-react";
import type { Propiedad } from "@/domain/entities/propiedad";

const ESTADO_STYLES: Record<Propiedad["estado"], { label: string; bg: string; text: string }> = {
  disponible: { label: "Disponible", bg: "bg-status-success", text: "text-status-success" },
  separado: { label: "Separado", bg: "bg-status-warning", text: "text-status-warning" },
  vendido: { label: "Vendido", bg: "bg-status-destructive", text: "text-status-destructive" },
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
      className={`flex gap-3 p-3 rounded-xl text-left transition-all duration-150 border ${
        selected
          ? "border-primary bg-primary/5 shadow-card"
          : "border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:shadow-card-hover dark:hover:border-primary/30"
      }`}
    >
      <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{propiedad.titulo}</p>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {propiedad.distrito && `${propiedad.distrito}, `}
          {propiedad.ciudad}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs font-semibold ${cfg.text}`}>
            {formatPrice(propiedad.precio, propiedad.moneda)}
          </span>
          <span
            className={`text-[10px] font-medium text-white px-1.5 py-0.5 rounded-full ${cfg.bg}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>
    </button>
  );
}
