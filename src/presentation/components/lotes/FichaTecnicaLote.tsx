import { useState } from "react";
import type { Lote } from "@/domain/entities/lote";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icon";
import { ConsultaLote } from "./ConsultaLote";

interface FichaTecnicaLoteProps {
  lote: Lote;
  onClose: () => void;
  modoVendedor?: boolean;
}

function formatPrice(price: number, currency: "PEN" | "USD"): string {
  const symbol = currency === "PEN" ? "S/" : "$";
  return `${symbol} ${price.toLocaleString("es-PE")}`;
}

export function FichaTecnicaLote({ lote, onClose, modoVendedor }: FichaTecnicaLoteProps) {
  const [showConsulta, setShowConsulta] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {lote.imagenPlano && (
          <div className="h-48 bg-muted rounded-t-2xl overflow-hidden">
            <img
              src={lote.imagenPlano}
              alt={`Plano lote ${lote.codigo}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="typo-headline-md text-foreground">{lote.codigo}</h3>
              <p className="typo-body-md text-muted-foreground">
                {lote.descripcion || "Lote en proyecto"}
              </p>
            </div>
            <StatusChip status={lote.estado === "reservado" ? "separado" : lote.estado} size="sm" />
          </div>

          <div className="bg-muted rounded-xl p-4">
            <p className="typo-label-md text-muted-foreground mb-1">Precio</p>
            <p className="typo-headline-md font-bold text-primary">
              {formatPrice(lote.precio, lote.moneda)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="square_foot" size={18} className="text-primary" />
                <p className="typo-label-md text-muted-foreground">Área Total</p>
              </div>
              <p className="typo-headline-md font-bold text-foreground">
                {lote.areaTotal.toLocaleString("es-PE")} m²
              </p>
            </div>
            {lote.frente && (
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="straighten" size={18} className="text-primary" />
                  <p className="typo-label-md text-muted-foreground">Frente</p>
                </div>
                <p className="typo-headline-md font-bold text-foreground">
                  {lote.frente} m
                </p>
              </div>
            )}
            {lote.fondo && (
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="straighten" size={18} className="text-primary" />
                  <p className="typo-label-md text-muted-foreground">Fondo</p>
                </div>
                <p className="typo-headline-md font-bold text-foreground">
                  {lote.fondo} m
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!modoVendedor && lote.estado === "disponible" && (
              <button
                onClick={() => setShowConsulta(true)}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold typo-label-md hover:brightness-110 transition-all"
              >
                Me interesa
              </button>
            )}
            {modoVendedor && (
              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-status-success/20 text-status-success py-3 rounded-xl font-bold typo-label-md">
                  Marcar Disponible
                </button>
                <button className="flex-1 bg-status-warning/20 text-status-warning py-3 rounded-xl font-bold typo-label-md">
                  Reservar
                </button>
                <button className="flex-1 bg-status-destructive/20 text-status-destructive py-3 rounded-xl font-bold typo-label-md">
                  Vender
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>
      </div>

      {showConsulta && (
        <ConsultaLote lote={lote} onClose={() => setShowConsulta(false)} />
      )}
    </div>
  );
}
