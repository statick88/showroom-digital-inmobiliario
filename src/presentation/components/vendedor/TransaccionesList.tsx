"use client";

/**
 * `<TransaccionesList>` — seller's transaction list (T-4.5, HU-008).
 *
 * Features:
 *   - 50 rows per page (DECISION Q5).
 *   - Date column formatted via `Intl.DateTimeFormat("es-PE")` → "dd/mm/yyyy".
 *   - Currency: S/ for PEN, $ for USD, with es-PE thousands grouping.
 *   - Skeleton while loading.
 *   - Empty state when the seller has no transactions yet.
 *   - Skips the fetch entirely when `vendedorId` is null.
 */

import { useState, useMemo } from "react";
import { useTransaccionesPorVendedor } from "@/presentation/hooks/useTransacciones";

const PAGE_SIZE = 50;
const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatMoney(amount: number, currency: "PEN" | "USD"): string {
  const symbol = currency === "PEN" ? "S/" : "$";
  return `${symbol} ${amount.toLocaleString("es-PE")}`;
}

interface TransaccionesListProps {
  vendedorId: string | null;
}

export function TransaccionesList({ vendedorId }: TransaccionesListProps) {
  const { data, isLoading } = useTransaccionesPorVendedor(vendedorId);
  const [page, setPage] = useState(0);

  const totalRows = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const pageRows = useMemo(
    () => (data ?? []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [data, page],
  );

  if (isLoading) {
    return (
      <div
        data-testid="transacciones-skeleton"
        className="space-y-2 rounded-xl border border-border bg-muted/30 p-4"
        aria-label="Cargando transacciones"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-md bg-muted"
            data-testid="skeleton-row"
          />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        data-testid="transacciones-empty"
        className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center"
      >
        <p className="typo-body-md text-muted-foreground">
          {vendedorId
            ? "Aun no tiene transacciones registradas."
            : "Inicia sesion para ver tus transacciones."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="transacciones-list">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left typo-body-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Fecha</th>
              <th className="px-4 py-2 font-semibold">Tipo</th>
              <th className="px-4 py-2 font-semibold">Comprador</th>
              <th className="px-4 py-2 font-semibold text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((t) => {
              const date = new Date(t.createdAt);
              return (
                <tr key={t.id} data-testid="transaccion-row" className="border-t border-border">
                  <td className="px-4 py-2 text-foreground">
                    {dateFormatter.format(date)}{" "}
                    <span className="text-muted-foreground">{timeFormatter.format(date)}</span>
                  </td>
                  <td className="px-4 py-2 capitalize text-foreground">{t.tipo}</td>
                  <td className="px-4 py-2 text-foreground">{t.compradorNombre}</td>
                  <td className="px-4 py-2 text-right font-semibold text-foreground">
                    {formatMoney(t.monto, t.moneda)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-1 typo-label-md text-muted-foreground"
          data-testid="transacciones-pagination"
        >
          <span>
            Pagina {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
