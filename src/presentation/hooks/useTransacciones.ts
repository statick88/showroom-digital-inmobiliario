"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transaccionesRepository } from "@/data/repositories";
import type { CrearTransaccionData } from "@/domain/entities/lote";
import { env } from "@/config/env";

export function useTransacciones(loteId?: string) {
  return useQuery({
    queryKey: ["transacciones", loteId],
    queryFn: () => transaccionesRepository.listar(loteId),
  });
}

export function useCrearTransaccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearTransaccionData) => transaccionesRepository.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transacciones"] });
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
