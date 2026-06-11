"use client";

import { useQuery } from "@tanstack/react-query";
import { transaccionesRepository } from "@/data/repositories/supabase-transacciones.repository.impl";
import { env } from "@/config/env";

export function useMetricas(proyectoId?: string) {
  const effectiveProyectoId = proyectoId ?? env.proyectoId;
  return useQuery({
    queryKey: ["metricas", effectiveProyectoId],
    queryFn: () => transaccionesRepository.obtenerMetricas(effectiveProyectoId),
    enabled: Boolean(effectiveProyectoId),
  });
}
