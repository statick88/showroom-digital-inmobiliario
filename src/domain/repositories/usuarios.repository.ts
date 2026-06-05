/**
 * `IUsuariosRepository` — contract for the user-roles domain.
 *
 * T-4.1 (PR-4). Consumed by `useUsuarios` (presentation) and implemented
 * by `supabase-usuarios.repository.impl.ts` (data).
 *
 * Why a contract here and not just exported from the impl?
 *   The presentation layer (`useUsuarios`) only needs the contract for
 *   type-safety. Tests can mock the contract without depending on the
 *   Supabase client. This is the same pattern used by
 *   `ILotesRepository` and `ITransaccionesRepository` in this project.
 *
 * Note on `crear`:
 *   The `crear` method delegates to the `crear-vendedor` Edge Function
 *   (HU-009) because `auth.admin.createUser` is not available from the
 *   browser. PR-5 (T-5.2) ships the Edge Function code.
 */

import type {
  VendedorProfile,
  CrearVendedorData,
  ActualizarVendedorData,
} from "@/domain/entities/vendedor";

export interface IUsuariosRepository {
  /** List all `usuarios_rol` rows. Admin-only by RLS. */
  listar(): Promise<VendedorProfile[]>;
  /** Fetch a single row by primary key. Returns null on PGRST116. */
  getById(id: string): Promise<VendedorProfile | null>;
  /** Fetch a single row by `auth_user_id` (used by `AdminLogin` post-signin). */
  getByAuthUserId(authUserId: string): Promise<VendedorProfile | null>;
  /**
   * Create a new vendedor (HU-009). Delegates to the
   * `crear-vendedor` Edge Function so the service-role key can be used
   * to create the matching `auth.users` row.
   */
  crear(data: CrearVendedorData): Promise<VendedorProfile>;
  /**
   * Update fields. The `rol` field is intentionally NOT in
   * `ActualizarVendedorData` and the impl drops it as defense in depth.
   */
  actualizar(id: string, data: ActualizarVendedorData): Promise<VendedorProfile>;
  /** Soft-delete: sets `activo = false` (preserves the audit trail). */
  desactivar(id: string): Promise<VendedorProfile>;
}
