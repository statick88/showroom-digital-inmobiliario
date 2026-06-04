"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { lotesRepository } from "@/data/repositories";
import type { Lote, EstadoLote } from "@/domain/entities/lote";

/**
 * useLoteStatusMutation — PR-1 (T-1.5) new hook.
 *
 * Replaces `useStatusMutation` for the LOTE flow. Writes to the `lotes`
 * table via `lotesRepository.cambiarEstado(loteId, estado)` instead of
 * writing to the legacy `propiedades` table.
 *
 * PR-5 (Propiedades migration) will swap the call site in
 * `AdminDashboard.tsx` once `usePropiedades.legacy` is replaced with
 * `useLotes`. Until then, both hooks coexist.
 */
interface LoteStatusChangeData {
  loteId: string;
  estado: EstadoLote;
}

export function useLoteStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<Lote, Error, LoteStatusChangeData>({
    mutationFn: async ({ loteId, estado }) => {
      return lotesRepository.cambiarEstado(loteId, estado);
    },
    onSuccess: () => {
      toast.success("Estado del lote actualizado");
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
    onError: (error: Error) => {
      toast.error("Error al cambiar estado del lote", {
        description: error.message,
      });
    },
  });
}
