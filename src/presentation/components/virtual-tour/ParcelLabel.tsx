import { Html } from "@react-three/drei";
import { PARCEL_BADGE_COLORS } from "@/config/parcel-colors";
import type { Lote } from "@/domain/entities/lote";

export interface ParcelLabelProps {
  lote: Lote;
  position: [number, number, number];
  onClick: (lote: Lote) => void;
}

function formatPrice(price: number | null | undefined, currency: "PEN" | "USD"): string {
  if (price === null || price === undefined) return "Consultar";
  const symbol = currency === "PEN" ? "S/" : "$";
  return `${symbol} ${price.toLocaleString("es-PE")}`;
}

/**
 * Renders an HTML badge overlay for a parcel inside the R3F Canvas.
 * Shows parcel code, status color, and formatted price.
 * Uses drei <Html> with distanceFactor for consistent sizing.
 * Touch target meets 44×44px minimum for mobile accessibility.
 */
export function ParcelLabel({ lote, position, onClick }: ParcelLabelProps) {
  const colors = PARCEL_BADGE_COLORS[lote.estado] ?? PARCEL_BADGE_COLORS.disponible;

  return (
    <Html position={position} distanceFactor={10} zIndexRange={[10, 0]}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick(lote);
        }}
        className="flex flex-col items-center gap-0.5 cursor-pointer select-none"
        style={{ minWidth: 44, minHeight: 44 }}
        aria-label={`Lote ${lote.codigo} - ${lote.estado} - ${formatPrice(lote.precio, lote.moneda)}`}
      >
        {/* Badge */}
        <span
          className="px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap shadow-md pointer-events-none"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {lote.codigo}
        </span>

        {/* Price */}
        <span className="text-[10px] text-white font-medium whitespace-nowrap drop-shadow-md pointer-events-none">
          {formatPrice(lote.precio, lote.moneda)}
        </span>
      </button>
    </Html>
  );
}
