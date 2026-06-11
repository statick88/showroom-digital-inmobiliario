"use client";

import { useState } from "react";
import { useTransacciones } from "@/presentation/hooks/useTransacciones";
import { usePagos, useTotalPagado, useCrearPago } from "@/presentation/hooks/usePagos";
import { metodoPagoSchema } from "@/lib/schemas/metodo-pago";
import type { CrearPagoData } from "@/domain/entities/pago";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Plus, ArrowLeft } from "lucide-react";

const METODO_PAGO_LABELS: Record<string, string> = {
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
  bcp: "BCP",
  interbank: "Interbank",
  bbva: "BBVA",
  scotiabank: "Scotiabank",
  efectivo: "Efectivo",
};

// ── Main PagosTab ──────────────────────────────────────────────
export function PagosTab() {
  const { data: transacciones, isLoading } = useTransacciones();
  const [selectedTransaccionId, setSelectedTransaccionId] = useState<string | null>(null);

  if (selectedTransaccionId) {
    return (
      <PagosDetalle
        transaccionId={selectedTransaccionId}
        onBack={() => setSelectedTransaccionId(null)}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground">Pagos</h2>
        <p className="text-sm text-muted-foreground">Registro de pagos por transacción</p>
      </header>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-modal">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-xs text-muted-foreground font-medium">Lote</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Tipo</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Monto</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Comprador</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Fecha</th>
                <th className="p-4 text-xs text-muted-foreground font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : (transacciones ?? []).length > 0 ? (
                (transacciones ?? []).map((t) => (
                  <tr key={t.id} className="hover:bg-muted transition-colors">
                    <td className="p-4 text-sm text-primary font-medium">{t.loteId.slice(0, 8)}...</td>
                    <td className="p-4 text-sm capitalize">{t.tipo}</td>
                    <td className="p-4 text-sm font-medium">
                      {t.moneda === "PEN" ? "S/" : "$"}{" "}
                      {t.monto.toLocaleString("es-PE")}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {t.compradorNombre || "—"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTransaccionId(t.id)}
                      >
                        <CircleDollarSign size={14} className="mr-1" />
                        Pagos
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No hay transacciones"
                      description="Las transacciones aparecerán aquí cuando se registren ventas."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Payment Detail View ────────────────────────────────────────
function PagosDetalle({
  transaccionId,
  onBack,
}: {
  transaccionId: string;
  onBack: () => void;
}) {
  const { data: pagos, isLoading: pagosLoading } = usePagos(transaccionId);
  const { data: totalPagado = 0 } = useTotalPagado(transaccionId);
  const crearPago = useCrearPago();

  const [form, setForm] = useState({
    monto: "",
    metodoPago: "transferencia",
    cci: "",
    referenciaExterna: "",
    notas: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.monto || Number(form.monto) <= 0) return;

    const data: CrearPagoData = {
      transaccionId,
      monto: Number(form.monto),
      metodoPago: form.metodoPago as CrearPagoData["metodoPago"],
      cci: form.cci || undefined,
      referenciaExterna: form.referenciaExterna || undefined,
      notas: form.notas || undefined,
      fechaPago: new Date().toISOString(),
    };

    crearPago.mutate(data, {
      onSuccess: () => {
        setForm({ monto: "", metodoPago: "transferencia", cci: "", referenciaExterna: "", notas: "" });
      },
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Detalle de Pagos</h2>
          <p className="text-sm text-muted-foreground">Transacción {transaccionId.slice(0, 8)}...</p>
        </div>
      </header>

      {/* Balance Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total pagado</span>
          <span className="text-lg font-bold text-status-success">S/ {totalPagado.toLocaleString("es-PE")}</span>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Registrar Pago</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Monto (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                placeholder="0.00"
                required
                aria-label="Monto en soles"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Método de Pago</label>
              <select
                value={form.metodoPago}
                onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm"
                aria-label="Método de pago"
              >
                {metodoPagoSchema.options.map((m) => (
                  <option key={m} value={m}>
                    {METODO_PAGO_LABELS[m] ?? m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CCI (opcional)</label>
              <input
                type="text"
                value={form.cci}
                onChange={(e) => setForm({ ...form, cci: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                placeholder="000-000-00000000000-000"
                aria-label="Código CCI"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Referencia (opcional)</label>
              <input
                type="text"
                value={form.referenciaExterna}
                onChange={(e) => setForm({ ...form, referenciaExterna: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                placeholder="N° operación, comprobante..."
                aria-label="Referencia externa"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Notas (opcional)</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-card text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
              rows={2}
              placeholder="Observaciones..."
              aria-label="Notas del pago"
            />
          </div>
          <Button type="submit" disabled={crearPago.isPending}>
            <Plus size={16} className="mr-1" />
            {crearPago.isPending ? "Registrando..." : "Registrar Pago"}
          </Button>
        </form>
      </div>

      {/* Payments List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Historial de Pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-xs text-muted-foreground font-medium">Fecha</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Método</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Monto</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">CCI</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Referencia</th>
                <th className="p-4 text-xs text-muted-foreground font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pagosLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    Cargando...
                  </td>
                </tr>
              ) : (pagos ?? []).length > 0 ? (
                (pagos ?? []).map((pago) => (
                  <tr key={pago.id} className="hover:bg-muted transition-colors">
                    <td className="p-4 text-sm">
                      {new Date(pago.fechaPago).toLocaleDateString("es-PE")}
                    </td>
                    <td className="p-4 text-sm">
                      {METODO_PAGO_LABELS[pago.metodoPago] ?? pago.metodoPago}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      S/ {pago.monto.toLocaleString("es-PE")}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{pago.cci || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{pago.referenciaExterna || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{pago.notas || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No hay pagos registrados"
                      description="Registra un pago para comenzar."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
