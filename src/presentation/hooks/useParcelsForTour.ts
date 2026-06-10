"use client";

import { useMemo } from "react";
import { useVirtualTour } from "@/presentation/hooks/use-virtual-tour";
import { useLotes } from "@/presentation/hooks/useLotes";
import { useRealtimeLotes } from "@/presentation/hooks/useRealtimeLotes";
import type { Lote } from "@/domain/entities/lote";

export type GeoCoordinate = { lat: number; lng: number };

export interface UseParcelsForTourResult {
  /** Lotes for the tour's project, or empty if no panoramaCenter. */
  parcels: Lote[];
  /** Center coordinate for the initial scene, or null if unavailable. */
  panoramaCenter: GeoCoordinate | null;
  /** True while tour or lotes are loading. */
  isLoading: boolean;
}

/**
 * Provides the parcels (lotes) and panoramaCenter needed by the
 * virtual tour overlay. The hook:
 *   1. Loads the tour by ID.
 *   2. Extracts `panoramaCenter` from the initial scene.
 *   3. Loads lotes for the tour's `proyectoId`.
 *   4. Returns empty parcels if `panoramaCenter` is undefined.
 *   5. Subscribes to realtime lotes updates.
 */
export function useParcelsForTour(tourId: string): UseParcelsForTourResult {
  const { data: tour, isLoading: tourLoading } = useVirtualTour(tourId);
  const proyectoId = tour?.proyectoId;

  const { data: lotes, isLoading: lotesLoading } = useLotes(
    proyectoId ?? "",
  );

  useRealtimeLotes();

  const panoramaCenter = useMemo<GeoCoordinate | null>(() => {
    if (!tour?.escenas?.length) return null;
    const initialScene = tour.escenas.find(
      (s) => s.id === tour.escenaInicialId,
    ) ?? tour.escenas[0];
    return initialScene?.panoramaCenter ?? null;
  }, [tour]);

  const parcels = useMemo<Lote[]>(() => {
    if (!panoramaCenter) return [];
    return lotes ?? [];
  }, [panoramaCenter, lotes]);

  return {
    parcels,
    panoramaCenter,
    isLoading: tourLoading || lotesLoading,
  };
}
