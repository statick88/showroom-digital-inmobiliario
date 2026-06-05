import { describe, it, expect } from "vitest";

/**
 * Domain types for the VendedorPanel feature (T-4.1, T-4.2, T-4.3).
 *
 * This file is a *type* module — it only declares interfaces / type aliases.
 * Tests here are intentionally minimal because they only validate that the
 * shapes compile and behave as documented. The behaviour lives in the
 * repository impl tests (`supabase-usuarios.repository.impl.test.ts`) and
 * the hook tests (`useUsuarios.test.ts`).
 *
 * Why a separate file (not in `lote.ts`)?
 *   - Fase 3 introduces a new "user domain" (HU-009 + HU-007). Keeping the
 *     VendedorProfile types in their own file keeps `lote.ts` focused on
 *     the lotization domain and makes the user surface easier to evolve
 *     without touching the lot domain.
 */

import type {
  VendedorProfile,
  CrearVendedorData,
  ActualizarVendedorData,
} from "@/domain/entities/vendedor";

describe("vendedor entity (T-4.1) — type-level sanity", () => {
  it("(1) VendedorProfile is structurally compatible with the usuarios_rol table", () => {
    // We do not `instanceof` here because these are TypeScript-only
    // interfaces. The test enforces the SHAPE that the table row must
    // satisfy so the supabase mapping function is type-safe.
    const sample: VendedorProfile = {
      id: "row-1",
      authUserId: "auth-1",
      email: "vendedor@inmobiliaria.pe",
      nombre: "María García",
      rol: "vendedor",
      telefono: "+51999000111",
      activo: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    expect(sample.id).toBe("row-1");
    expect(sample.authUserId).toBe("auth-1");
    expect(sample.rol).toBe("vendedor");
  });

  it("(2) VendedorProfile can mark a deactivated user via activo=false", () => {
    const deactivated: VendedorProfile = {
      id: "row-2",
      authUserId: "auth-2",
      email: "v2@inmobiliaria.pe",
      nombre: "Vendedor 2",
      rol: "vendedor",
      activo: false,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    expect(deactivated.activo).toBe(false);
    expect(deactivated.telefono).toBeUndefined();
  });

  it("(3) CrearVendedorData shape excludes id/createdAt/updatedAt — those are server-generated", () => {
    // The CrearVendedorData type intentionally omits server-generated
    // fields. A `crear()` call site cannot sneak them in.
    const data: CrearVendedorData = {
      email: "nuevo@inmobiliaria.pe",
      password: "temporal123",
      nombre: "Vendedor Nuevo",
      rol: "vendedor",
    };

    // @ts-expect-error id is server-generated and should not be assignable
    const _idCheck: string = data.id;
    // @ts-expect-error createdAt is server-generated and should not be assignable
    const _createdAtCheck: string = data.createdAt;

    expect(data.email).toBe("nuevo@inmobiliaria.pe");
  });

  it("(4) ActualizarVendedorData has all fields optional and excludes rol (defense in depth)", () => {
    // `rol` is intentionally NOT part of ActualizarVendedorData — only
    // an admin can change rol, and that goes through a separate code
    // path in PR-5 (T-5.3). Defense in depth: even if a caller tried
    // to spread `{ rol: 'admin' }` from a stale cache, TS would reject
    // it.
    const partial: ActualizarVendedorData = { telefono: "+51999000111" };
    // @ts-expect-error rol is not a member of ActualizarVendedorData
    const _rolCheck: "admin" = partial.rol;

    expect(partial.telefono).toBe("+51999000111");
  });
});
