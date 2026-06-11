import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { virtualTourRepository } from "@/data/repositories";
import type { CrearVirtualTourData, ActualizarVirtualTourData } from "@/domain/entities/virtual-tour";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function useVirtualTours() {
  return useQuery({
    queryKey: ["virtual-tours"],
    queryFn: () => virtualTourRepository.findAll(),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useVirtualTour(tourId: string | undefined) {
  return useQuery({
    queryKey: ["virtual-tours", tourId],
    queryFn: () => virtualTourRepository.findById(tourId!),
    enabled: !!tourId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useVirtualToursByProyecto(proyectoId: string | undefined) {
  return useQuery({
    queryKey: ["virtual-tours", "proyecto", proyectoId],
    queryFn: () => virtualTourRepository.findByProyectoId(proyectoId!),
    enabled: !!proyectoId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCrearVirtualTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearVirtualTourData) => virtualTourRepository.create(data),
    onSuccess: (_newTour, variables) => {
      qc.invalidateQueries({ queryKey: ["virtual-tours"] });
    },
  });
}

export function useActualizarVirtualTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarVirtualTourData }) =>
      virtualTourRepository.update(id, data),
    onSuccess: (updatedTour) => {
      qc.invalidateQueries({ queryKey: ["virtual-tours"] });
    },
  });
}

export function useEliminarVirtualTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => virtualTourRepository.delete(id),
    onSuccess: (_result, deletedId) => {
      qc.invalidateQueries({ queryKey: ["virtual-tours", deletedId] });
      // Note: We can't easily invalidate the proyecto list without knowing the proyectoId
      // The calling component should handle this if needed
    },
  });
}
