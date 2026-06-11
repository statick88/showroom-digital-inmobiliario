import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tourPOIsRepository } from "@/data/repositories";
import type {
  TourPOI,
  CreatePOIData,
  UpdatePOIData,
} from "@/domain/entities/tour-poi";

const QUERY_KEY_PREFIX = "tour-pois";

export function usePOIs(tourId: string) {
  const queryClient = useQueryClient();

  const pois = useQuery({
    queryKey: [QUERY_KEY_PREFIX, tourId],
    queryFn: () => tourPOIsRepository.list(tourId),
    enabled: Boolean(tourId),
  });

  const createPOI = useMutation({
    mutationFn: (data: CreatePOIData) => tourPOIsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, tourId] });
    },
  });

  const updatePOI = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePOIData }) =>
      tourPOIsRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, tourId] });
    },
  });

  const deletePOI = useMutation({
    mutationFn: (id: string) => tourPOIsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, tourId] });
    },
  });

  return {
    pois: pois.data ?? [],
    isLoading: pois.isLoading,
    isError: pois.isError,
    error: pois.error,
    createPOI,
    updatePOI,
    deletePOI,
  };
}
