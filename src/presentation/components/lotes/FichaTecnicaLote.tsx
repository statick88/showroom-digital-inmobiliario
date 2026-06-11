import type { Lote } from "@/domain/entities/lote";
import { useLoteStatusMutation } from "@/presentation/hooks/useLoteStatusMutation";
import { LoteDetailContent } from "./LoteDetailContent";

interface FichaTecnicaLoteProps {
  lote: Lote;
  onClose: () => void;
  modoVendedor?: boolean;
  coordenadasCentro?: { lat: number; lng: number };
  nombreProyecto?: string;
  ubicacionProyecto?: string;
}

export function FichaTecnicaLote({
  lote,
  onClose,
  modoVendedor,
  coordenadasCentro,
  nombreProyecto,
  ubicacionProyecto,
}: FichaTecnicaLoteProps) {
  // T-4.4: Reservar button delegates to useLoteStatusMutation so the
  // mutation hook owns the toast + cache invalidation.
  const { mutate: cambiarEstado, isPending } = useLoteStatusMutation();

  const handleEstadoChange = (estado: "disponible" | "reservado" | "vendido") => {
    cambiarEstado({ loteId: lote.id, estado });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <LoteDetailContent
          lote={lote}
          onClose={onClose}
          modoVendedor={modoVendedor}
          coordenadasCentro={coordenadasCentro}
          nombreProyecto={nombreProyecto}
          ubicacionProyecto={ubicacionProyecto}
        />

        {modoVendedor && (
          <div className="px-6 pb-6 flex gap-2">
            <button
              onClick={() => handleEstadoChange("disponible")}
              disabled={isPending}
              className="flex-1 bg-status-success/20 text-status-success py-3 rounded-xl font-bold typo-label-md disabled:opacity-50"
            >
              Marcar Disponible
            </button>
            <button
              onClick={() => handleEstadoChange("reservado")}
              disabled={isPending}
              className="flex-1 bg-status-warning/20 text-status-warning py-3 rounded-xl font-bold typo-label-md disabled:opacity-50"
            >
              Reservar
            </button>
            <button
              onClick={() => handleEstadoChange("vendido")}
              disabled={isPending}
              className="flex-1 bg-status-destructive/20 text-status-destructive py-3 rounded-xl font-bold typo-label-md disabled:opacity-50"
            >
              Vender
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
