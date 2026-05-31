"use client";

import { useQuery } from "@tanstack/react-query";
import { proyectosRepository } from "@/data/repositories";

export function useProyectos() {
  return useQuery({
    queryKey: ["proyectos"],
    queryFn: () => proyectosRepository.listar(),
  });
}

export function useProyecto(id: string | undefined) {
  return useQuery({
    queryKey: ["proyecto", id],
    queryFn: () => proyectosRepository.obtenerPorId(id!),
    enabled: !!id,
  });
}
