"use client";

import { useQuery } from "@tanstack/react-query";
import { propiedadesRepository } from "@/data/repositories";

const AGENCIA_ID = "a0000000-0000-0000-0000-000000000001";

export function useMetricas() {
  return useQuery({
    queryKey: ["metricas"],
    queryFn: () => propiedadesRepository.obtenerDashboard(AGENCIA_ID),
  });
}
