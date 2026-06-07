/**
 * Vendedor (seller) domain entity.
 *
 * T-4.1 — `refactor-lotizacion-fase-3` / PR-4.
 *
 * These types model the rows of the `public.usuarios_rol` table from
 * `supabase/migrations/00005_lotizacion_schema.sql:47`. The shape is
 * deliberately close to the DB row so the supabase mapping function in
 * `supabase-usuarios.repository.impl.ts` is a 1:1 translation.
 *
 * Two slight divergences from the raw row:
 *   1. Field names are camelCase (project convention — the rest of the
 *      domain layer uses camelCase, snake_case is mapped at the
 *      data-layer boundary).
 *   2. `CrearVendedorData` carries a `password` field that is consumed
 *      by the `crear-vendedor` Edge Function and NEVER persisted on
 *      `usuarios_rol`. Treat it as write-only and never echo it back.
 *
 * Note about `proyectoId` / `dni`:
 *   The lotization refactor now persists both fields on
 *   `usuarios_rol`, but existing rows may still have NULLs. We keep
 *   them optional in the read model so older rows and test fixtures
 *   remain valid, while creation flows require both values.
 */

/** A row in the `public.usuarios_rol` table, mapped to the JS layer. */
export interface VendedorProfile {
  id: string;
  authUserId: string;
  email: string;
  nombre: string;
  rol: "admin" | "vendedor" | "comprador";
  telefono?: string;
  proyectoId?: string;
  dni?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload for `usuariosRepository.crear` (HU-009 admin form). */
export interface CrearVendedorData {
  email: string;
  /** Write-only. Forwarded to the Edge Function; never returned / stored. */
  password: string;
  nombre: string;
  rol: "admin" | "vendedor" | "comprador";
  dni: string;
  telefono?: string;
  proyectoId?: string;
}

/** Payload for `usuariosRepository.actualizar` (HU-009 edit form). */
export interface ActualizarVendedorData {
  nombre?: string;
  telefono?: string;
  proyectoId?: string;
  activo?: boolean;
  // `rol` is INTENTIONALLY excluded: a self-edit must not be able to
  // promote itself. RLS + the form layer (T-5.3) enforce the same
  // invariant on the server side. Defense in depth.
}
