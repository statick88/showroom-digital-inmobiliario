"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lotesRepository } from "@/data/repositories";
import { env } from "@/config/env";
import { useAuthStore } from "@/presentation/hooks/useAuthStore";
import type { CrearLoteData, EstadoLote, FiltrosLotes } from "@/domain/entities/lote";

export function useLotes(proyectoId: string, filtros?: FiltrosLotes) {
  return useQuery({
    queryKey: ["lotes", proyectoId, filtros],
    queryFn: () => lotesRepository.listar(proyectoId, filtros),
  });
}

/**
 * `useLotesPorVendedor` (T-4.3) — scope the lot list to the seller's
 * assigned project.
 *
 *   1. Reads `proyectoId` from `useAuthStore` (set by
 *      `setFromUsuariosRol` after sign-in).
 *   2. Falls back to `env.proyectoId` when no `proyectoId` is set.
 *   3. Calls `lotesRepository.listar(proyectoId, filtros)`.
 *
 * The `vendedorId` parameter is currently NOT used to filter the
 * result server-side; this is intentional because the
 * `usuarios_rol.proyecto_id` column has not been migrated yet. When
 * the column lands, this hook will:
 *   - Reject vendedores whose `proyectoId` does not match the route
 *     (defense in depth on top of RLS).
 *   - Continue to scope by project, which is the actual access-control
 *     boundary for HU-007.
 *
 * Query key is `['lotes-por-vendedor', proyectoId, filtros, vendedorId]`
 * so the cache is independent of the default `useLotes` cache.
 */
export function useLotesPorVendedor(vendedorId: string, filtros?: FiltrosLotes) {
  const authProyectoId = useAuthStore((s) => s.proyectoId);
  const proyectoId = authProyectoId ?? env.proyectoId;
  return useQuery({
    queryKey: ["lotes-por-vendedor", proyectoId, filtros, vendedorId],
    queryFn: () => lotesRepository.listar(proyectoId, filtros),
    enabled: Boolean(proyectoId) && Boolean(vendedorId),
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
