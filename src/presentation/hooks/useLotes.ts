"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lotesRepository } from "@/data/repositories";
import type { CrearLoteData, EstadoLote, FiltrosLotes } from "@/domain/entities/lote";

export function useLotes(proyectoId: string, filtros?: FiltrosLotes) {
  return useQuery({
    queryKey: ["lotes", proyectoId, filtros],
    queryFn: () => lotesRepository.listar(proyectoId, filtros),
  });
}

export function useLote(id: string | undefined) {
  return useQuery({
    queryKey: ["lote", id],
    queryFn: () => lotesRepository.obtenerPorId(id!),
    enabled: !!id,
  });
}

export function useCrearLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearLoteData) => lotesRepository.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useActualizarLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrearLoteData> }) =>
      lotesRepository.actualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useCambiarEstadoLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoLote }) =>
      lotesRepository.cambiarEstado(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}

export function useEliminarLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lotesRepository.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}
