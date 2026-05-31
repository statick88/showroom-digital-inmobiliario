import type { Propiedad } from "@/domain/entities/propiedad";
import { formatPrice } from "@/presentation/lib/formatters";
import { StatusChip } from "@/components/ui/status-chip";

interface MarkerPopupProps {
  propiedad: Propiedad;
}

export function MarkerPopup({ propiedad }: MarkerPopupProps) {
  return (
    <div className="font-sans text-sm leading-snug min-w-[200px]">
      <div className="flex items-start gap-3">
        <div className="relative h-24 w-28 shrink-0 rounded-lg overflow-hidden">
          <img
            src={propiedad.imagenes[0]!}
            alt={propiedad.titulo}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-base font-semibold mb-1">{propiedad.titulo}</p>
          <p className="text-zinc-600 mb-1">
            {propiedad.distrito && `${propiedad.distrito}, `}
            {propiedad.ciudad}
          </p>
          <p className="text-lg font-bold mb-1">
            {formatPrice(propiedad.precio, propiedad.moneda)}
          </p>
          <StatusChip status={propiedad.estado} size="sm" />
          <p className="text-zinc-500 mt-1 text-xs">Código: {propiedad.codigo}</p>
        </div>
      </div>
    </div>
  );
}
