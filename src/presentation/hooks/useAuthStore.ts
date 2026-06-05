/**
 * `useAuthStore` — Zustand store for the post-signin auth state (T-4.2).
 *
 * Why a separate store from the existing `authenticated` flag in App.tsx?
 *   - The store survives page reloads (localStorage persistence).
 *   - Components anywhere in the tree can read the role without
 *     prop-drilling.
 *   - Role-gated routes (`<RoleGuard>`) need synchronous access to
 *     `rol` and `sessionChecked` to decide render vs. redirect.
 *
 * Shape:
 *   { rol, authUserId, email, nombre, id, sessionChecked, proyectoId? }
 *
 * `proyectoId` is included so T-4.3 (`useLotesPorVendedor`) can filter
 * lots by the seller's assigned project. The field is optional because
 * the current `usuarios_rol` table does not yet have the column — the
 * spec calls for it, but the migration lands in a later PR.
 *
 * Persistence:
 *   - Persists under the key `showroom-auth-state` in localStorage.
 *   - The persisted slice includes the whole state (Zustand default).
 *   - On `reset()`, the role and identity are cleared but
 *     `sessionChecked` is kept at `true` so RoleGuard does not loop
 *     trying to re-hydrate.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { VendedorProfile } from "@/domain/entities/vendedor";

export type Rol = "admin" | "vendedor" | "comprador";

export interface AuthState {
  /** Primary key on `usuarios_rol` (UUID). */
  id: string | null;
  /** Supabase `auth.users.id` of the underlying account. */
  authUserId: string | null;
  email: string | null;
  nombre: string | null;
  rol: Rol | null;
  /**
   * Project the vendedor is assigned to. Optional because the column
   * does not yet exist; see T-4.3 hook for the filter behaviour.
   */
  proyectoId: string | null;
  /**
   * `true` once the initial `getSession()` call has resolved. Distinguishes
   * "loading" from "definitively unauthenticated" so the UI does not flash.
   */
  sessionChecked: boolean;

  setFromUsuariosRol: (
    row: VendedorProfile,
    options?: { sessionChecked?: boolean; proyectoId?: string | null },
  ) => void;
  /** Clear identity fields, keep `sessionChecked: true`. */
  reset: () => void;
}

const STORAGE_KEY = "showroom-auth-state";

/**
 * A stable, always-defined `Storage` adapter that delegates to
 * `window.localStorage` at call-time. The thunk passed to
 * `createJSONStorage` is evaluated when the persist middleware
 * initializes, which happens at module-load — by then, the test
 * environment has not yet attached its mock. Returning a fixed
 * object whose methods look up `window.localStorage` lazily avoids
 * the "no-op storage" path that Zustand falls into when the thunk
 * returns `undefined`.
 */
function makeLazyStorage(): Storage {
  const getStore = (): Storage | null =>
    typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  return {
    get length() {
      return getStore()?.length ?? 0;
    },
    clear() {
      getStore()?.clear();
    },
    getItem(key) {
      return getStore()?.getItem(key) ?? null;
    },
    key(index) {
      return getStore()?.key(index) ?? null;
    },
    removeItem(key) {
      getStore()?.removeItem(key);
    },
    setItem(key, value) {
      getStore()?.setItem(key, value);
    },
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      id: null,
      authUserId: null,
      email: null,
      nombre: null,
      rol: null,
      proyectoId: null,
      sessionChecked: false,

      setFromUsuariosRol: (row, options = {}) =>
        set({
          id: row.id,
          authUserId: row.authUserId,
          email: row.email,
          nombre: row.nombre,
          rol: row.rol,
          proyectoId: options.proyectoId ?? null,
          sessionChecked: options.sessionChecked ?? true,
        }),

      reset: () =>
        set({
          id: null,
          authUserId: null,
          email: null,
          nombre: null,
          rol: null,
          proyectoId: null,
          // Keep sessionChecked true so RoleGuard does not loop.
          // The next page reload will re-evaluate via getSession().
          sessionChecked: true,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => makeLazyStorage()),
      // Only persist the auth slice (skip the action functions)
      partialize: (state) => ({
        id: state.id,
        authUserId: state.authUserId,
        email: state.email,
        nombre: state.nombre,
        rol: state.rol,
        proyectoId: state.proyectoId,
        sessionChecked: state.sessionChecked,
      }),
    },
  ),
);
