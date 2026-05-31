"use client";

import { useQuery } from "@tanstack/react-query";
import { transaccionesRepository } from "@/data/repositories/supabase-transacciones.repository.impl";
import { env } from "@/config/env";

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas", env.proyectoId],
    queryFn: () => transaccionesRepository.obtenerMetricas(env.proyectoId),
  });
}
