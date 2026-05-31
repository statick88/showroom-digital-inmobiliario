import { Building } from "lucide-react";
import type { Propiedad } from "@/domain/entities/propiedad";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/ui/status-chip";
import { formatPrice } from "@/presentation/lib/formatters";

export function PropertyCard({
  propiedad,
  selected,
  onClick,
}: {
  propiedad: Propiedad;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex gap-4 p-3 rounded-xl transition-all duration-200 group cursor-pointer bg-card",
        "border shadow-card hover:shadow-card-hover hover:border-primary",
        selected ? "border-primary shadow-card" : "border-border/50",
      )}
    >
      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {propiedad.imagenes.length > 0 ? (
          <img
            src={propiedad.imagenes[0]!}
            alt={propiedad.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building size={20} className="text-muted-foreground" aria-label="Sin imagen" />
          </div>
        )}
        <div className="absolute top-1 right-1">
          <StatusChip status={propiedad.estado} size="sm" />
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="typo-body-md font-semibold text-foreground line-clamp-1">
            {propiedad.titulo}
          </h3>
          <p className="typo-label-md text-muted-foreground flex items-center gap-1 mt-1">
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
            <span className="truncate">
              {[propiedad.distrito, propiedad.ciudad].filter(Boolean).join(", ")}
            </span>
          </p>
        </div>
        <p className="typo-currency-md text-primary mt-2">
          {formatPrice(propiedad.precio, propiedad.moneda)}
        </p>
      </div>
    </button>
  );
}
