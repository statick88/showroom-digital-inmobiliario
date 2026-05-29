"use client";

import { useQuery } from "@tanstack/react-query";
import { propiedadesRepository } from "@/data/repositories";
import type { FiltrosPropiedades } from "@/domain/repositories/propiedades.repository";

export function usePropiedades(filtros?: FiltrosPropiedades) {
  return useQuery({
    queryKey: ["propiedades", filtros],
    queryFn: () => propiedadesRepository.listar(filtros),
  });
}
