"use client";

import { useQuery } from "@tanstack/react-query";
import { propiedadesRepository } from "@/data/repositories";
import { env } from "@/config/env";

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas"],
    queryFn: () => propiedadesRepository.obtenerDashboard(env.agenciaId),
  });
}
