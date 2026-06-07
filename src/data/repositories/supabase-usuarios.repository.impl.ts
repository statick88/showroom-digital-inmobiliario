/**
 * Supabase implementation of `IUsuariosRepository`.
 *
 * T-4.1 (PR-4). Five of the six methods are plain `from('usuarios_rol')`
 * queries. The sixth — `crear` — delegates to the `crear-vendedor`
 * Edge Function (HU-009) because the browser cannot call
 * `auth.admin.createUser`. PR-5 (T-5.2) ships the Edge Function code;
 * for now, the call will fail at runtime, which is intentional (we
 * mock it in unit tests).
 *
 * Design notes:
 *   - `actualizar` is a PATCH: it only forwards fields that are
 *     `!== undefined`, mirroring the `lotesRepository.actualizar`
 *     pattern. The `rol` field is filtered out as defense in depth
 *     (the type system already prevents it, but a `// @ts-ignore`
 *     smuggle attempt must not succeed).
 *   - `desactivar` is a PATCH that sets `activo = false`. The row is
 *     preserved (soft delete) so `audit_log` can record the change.
 *   - The snake_case ↔ camelCase mapping is centralised in
 *     `mapRowToVendedor` so the 4 read paths cannot diverge.
 */

import { supabase } from "@/lib/supabase/client";
import { rethrowIfPresent } from "@/lib/supabase/errors";
import type { IUsuariosRepository } from "@/domain/repositories/usuarios.repository";
import type { VendedorProfile, ActualizarVendedorData } from "@/domain/entities/vendedor";

function mapRowToVendedor(row: Record<string, unknown>): VendedorProfile {
  return {
    id: row.id as string,
    authUserId: row.auth_user_id as string,
    email: row.email as string,
    nombre: row.nombre as string,
    rol: row.rol as VendedorProfile["rol"],
    telefono: (row.telefono as string | null) ?? undefined,
    activo: row.activo as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const usuariosRepository: IUsuariosRepository = {
  // ── listar ─────────────────────────────────────────────────────
  async listar() {
    const { data, error } = await supabase
      .from("usuarios_rol")
      .select("*")
      .order("created_at", { ascending: false });

    rethrowIfPresent(error, "Error al listar usuarios");
    return (data ?? []).map(mapRowToVendedor);
  },

  // ── getById ────────────────────────────────────────────────────
  async getById(id) {
    const { data, error } = await supabase.from("usuarios_rol").select("*").eq("id", id).single();

    if (error) return null;
    return mapRowToVendedor(data);
  },

  // ── getByAuthUserId ────────────────────────────────────────────
  async getByAuthUserId(authUserId) {
    const { data, error } = await supabase
      .from("usuarios_rol")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    if (error) return null;
    return mapRowToVendedor(data);
  },

  // ── crear (Edge Function → RPC fallback) ──────────────────────
  // T-5.2: the Edge Function is the primary path (it has the
  // service-role key in scope, RLS check + transactional insert in
  // one place). If the Edge Function is not enabled on the project
  // (some Supabase plans do not include Edge Functions), we fall
  // back to the `crear_vendedor` RPC, which mirrors the same logic
  // in SQL with `SECURITY DEFINER`. The repo is unaware of which
  // path executed; the consumer just gets a `VendedorProfile`.
  async crear(payload) {
    // ── Primary: Edge Function ──────────────────────────────
    const { data, error } = await supabase.functions.invoke("crear-vendedor", {
      body: payload,
    });

    if (!error && data?.usuarios_rol) {
      return mapRowToVendedor(data.usuarios_rol as Record<string, unknown>);
    }

    // Capture the original error for re-throw if the fallback also
    // fails. Logging here is intentional — every site in the repo
    // uses `console.error` until we wire `logError` in a follow-up.
    const originalError = error;
    console.warn(
      "[usuariosRepository.crear] Edge Function failed, attempting RPC fallback:",
      originalError,
    );

    // ── Fallback: RPC ───────────────────────────────────────
    const { data: rpcData, error: rpcError } = await supabase.rpc("crear_vendedor", {
      p_email: payload.email,
      p_password: payload.password,
      p_nombre: payload.nombre,
      p_rol: payload.rol,
      p_telefono: payload.telefono ?? null,
      p_proyecto_id: payload.proyectoId ?? null,
    });

    if (!rpcError && rpcData) {
      return mapRowToVendedor(rpcData as Record<string, unknown>);
    }

    // Both paths failed. Surface the original Edge Function error so
    // the operator can debug "is the function deployed?" before
    // chasing a misconfigured RPC.
    console.error(
      "[usuariosRepository.crear] Edge Function and RPC fallback both failed. Original:",
      originalError,
      "RPC:",
      rpcError,
    );
    rethrowIfPresent(
      originalError ?? rpcError ?? { message: "Edge Function and RPC returned no data" },
      "Error al crear vendedor",
    );
    // Unreachable; rethrowIfPresent throws.
    throw new Error("Error al crear vendedor");
  },

  // ── actualizar (PATCH) ─────────────────────────────────────────
  async actualizar(id, data: ActualizarVendedorData) {
    const updates: Record<string, unknown> = {};
    if (data.nombre !== undefined) updates.nombre = data.nombre;
    if (data.telefono !== undefined) updates.telefono = data.telefono;
    if (data.proyectoId !== undefined) updates.proyecto_id = data.proyectoId;
    if (data.activo !== undefined) updates.activo = data.activo;
    // `rol` is INTENTIONALLY never forwarded. The type already prevents
    // it but a `// @ts-ignore` must not be enough to promote a user.

    const { data: row, error } = await supabase
      .from("usuarios_rol")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al actualizar usuario");
    return mapRowToVendedor(row);
  },

  // ── desactivar (soft delete) ───────────────────────────────────
  async desactivar(id) {
    const { data: row, error } = await supabase
      .from("usuarios_rol")
      .update({ activo: false })
      .eq("id", id)
      .select("*")
      .single();

    rethrowIfPresent(error, "Error al desactivar usuario");
    return mapRowToVendedor(row);
  },
};
