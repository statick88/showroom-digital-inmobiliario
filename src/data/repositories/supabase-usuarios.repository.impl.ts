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

  // ── crear (Edge Function) ──────────────────────────────────────
  async crear(payload) {
    const { data, error } = await supabase.functions.invoke("crear-vendedor", {
      body: payload,
    });

    rethrowIfPresent(error, "Error al crear vendedor");
    return mapRowToVendedor(data.usuarios_rol as Record<string, unknown>);
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
