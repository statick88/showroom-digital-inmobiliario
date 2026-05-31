"use client";

import { useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { lotesRepository } from "@/data/repositories/supabase-lotes.repository.impl";

export function useTopClicks(limite = 10) {
  return useQuery({
    queryKey: ["top-lotes", limite],
    queryFn: async () => {
      const lotes = await lotesRepository.listar(env.proyectoId);
      return lotes.slice(0, limite).map((l) => ({
        propiedad: { id: l.id, codigo: l.codigo, titulo: l.codigo },
        clicks: l.areaTotal,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
