"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transaccionesRepository } from "@/data/repositories";
import type { CrearTransaccionData } from "@/domain/entities/lote";
import { env } from "@/config/env";

export const TRANSACCIONES_POR_VENDEDOR_QUERY_KEY = "transacciones-por-vendedor";

export function useTransacciones(loteId?: string) {
  return useQuery({
    queryKey: ["transacciones", loteId],
    queryFn: () => transaccionesRepository.listar(loteId),
  });
}

/**
 * T-4.5: fetches the transactions owned by a given seller. Returns
 * an empty array (NOT undefined) when `vendedorId` is null so the
 * caller can render the empty state without a type-guard.
 */
export function useTransaccionesPorVendedor(vendedorId: string | null) {
  return useQuery({
    queryKey: [TRANSACCIONES_POR_VENDEDOR_QUERY_KEY, vendedorId],
    queryFn: async () => {
      if (!vendedorId)
        return [] as Awaited<ReturnType<typeof transaccionesRepository.listarPorVendedor>>;
      return transaccionesRepository.listarPorVendedor(vendedorId);
    },
    enabled: Boolean(vendedorId),
  });
}

export function useCrearTransaccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearTransaccionData) => transaccionesRepository.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transacciones"] });
      qc.invalidateQueries({ queryKey: [TRANSACCIONES_POR_VENDEDOR_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useMetricas() {
  const proyectoId = env.proyectoId;
  return useQuery({
    queryKey: ["metricas", proyectoId],
    queryFn: () => transaccionesRepository.obtenerMetricas(proyectoId),
    enabled: !!proyectoId,
  });
}
