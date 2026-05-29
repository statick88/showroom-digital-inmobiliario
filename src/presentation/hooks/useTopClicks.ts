"use client";

import { useQuery } from "@tanstack/react-query";
import { metricasRepository } from "@/data/repositories";
import { env } from "@/config/env";

export function useTopClicks(limite = 10) {
  return useQuery({
    queryKey: ["top-clicks", limite],
    queryFn: () => metricasRepository.obtenerTopClicks(env.agenciaId, limite),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}