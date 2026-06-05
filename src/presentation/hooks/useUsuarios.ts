/**
 * TanStack Query wrappers around `usuariosRepository`.
 *
 * T-4.1 (PR-4). Five thin hooks:
 *   - `useUsuarios()`            — list all vendedor rows (admin only, RLS-enforced)
 *   - `useVendedorByAuthUser()`  — single row by `auth_user_id` (used post-signin)
 *   - `useCrearVendedor()`       — create mutation (delegates to Edge Function)
 *   - `useActualizarVendedor()`  — partial update mutation
 *   - `useDesactivarVendedor()`  — soft-delete mutation
 *
 * All write hooks invalidate `["usuarios"]` on success so any list
 * view in the app refetches in one place.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usuariosRepository } from "@/data/repositories";
import type {
  VendedorProfile,
  CrearVendedorData,
  ActualizarVendedorData,
} from "@/domain/entities/vendedor";

export const USUARIOS_QUERY_KEY = ["usuarios"] as const;
export const VENDEDOR_BY_AUTH_USER_QUERY_KEY = (authUserId: string) =>
  ["vendedor", "auth", authUserId] as const;

// ── Read hooks ────────────────────────────────────────────────────
export function useUsuarios() {
  return useQuery<VendedorProfile[]>({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: () => usuariosRepository.listar(),
  });
}

export function useVendedorByAuthUser(authUserId: string | undefined) {
  return useQuery<VendedorProfile | null>({
    queryKey: VENDEDOR_BY_AUTH_USER_QUERY_KEY(authUserId ?? ""),
    queryFn: () => usuariosRepository.getByAuthUserId(authUserId as string),
    enabled: Boolean(authUserId),
  });
}

// ── Write hooks ───────────────────────────────────────────────────
export function useCrearVendedor() {
  const qc = useQueryClient();
  return useMutation<VendedorProfile, Error, CrearVendedorData>({
    mutationFn: (data) => usuariosRepository.crear(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}

export function useActualizarVendedor() {
  const qc = useQueryClient();
  return useMutation<VendedorProfile, Error, { id: string; data: ActualizarVendedorData }>({
    mutationFn: ({ id, data }) => usuariosRepository.actualizar(id, data),
    onSuccess: (_row, { id }) => {
      void qc.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      // Best-effort: also invalidate any ["vendedor", "auth", ...] cache
      // entry that might match. The hook does not know the auth id here,
      // so we invalidate the whole ["vendedor"] prefix as a fallback.
      void qc.invalidateQueries({ queryKey: ["vendedor"] });
      // Touch the parameter so the linter is happy and to make the
      // intent explicit (id may be used by future hooks).
      void id;
    },
  });
}

export function useDesactivarVendedor() {
  const qc = useQueryClient();
  return useMutation<VendedorProfile, Error, string>({
    mutationFn: (id) => usuariosRepository.desactivar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
    },
  });
}
