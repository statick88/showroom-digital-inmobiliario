import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the supabase implementation of `IUsuariosRepository`.
 *
 * T-4.1 (PR-4) — verifies the 6 methods (listar, getById, getByAuthUserId,
 * crear, actualizar, desactivar) plus the snake_case ↔ camelCase mapping
 * and the Edge Function invocation for `crear`.
 *
 * Mocking strategy: a fluent chain mock identical to the one in
 * `supabase-lotes.repository.impl.test.ts`. The Edge Function call is
 * mocked via `supabase.functions.invoke`.
 */

import { usuariosRepository } from "@/data/repositories/supabase-usuarios.repository.impl";
import type { VendedorProfile } from "@/domain/entities/vendedor";

// ── Supabase chain mock ──────────────────────────────────────────────
const fromMock = vi.fn();
const singleMock = vi.fn();
const functionsInvokeMock = vi.fn();
const rpcMock = vi.fn();
const builderMethods: Record<string, ReturnType<typeof vi.fn>> = {};
const chain: Record<string, ReturnType<typeof vi.fn>> = {};

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-row-1",
    auth_user_id: "auth-1",
    email: "vendedor@inmobiliaria.pe",
    nombre: "María García",
    rol: "vendedor",
    telefono: "+51999000111",
    activo: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

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

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    functions: {
      invoke: (...args: unknown[]) => functionsInvokeMock(...args),
    },
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

vi.mock("@/lib/supabase/errors", () => ({
  rethrowIfPresent: (error: unknown) => {
    if (error) throw new Error((error as { message: string }).message ?? "supabase error");
  },
}));

beforeEach(() => {
  fromMock.mockReset();
  singleMock.mockReset();
  functionsInvokeMock.mockReset();
  rpcMock.mockReset();
  for (const k of Object.keys(builderMethods)) delete builderMethods[k];
  for (const k of Object.keys(chain)) delete chain[k];
  for (const name of ["select", "eq", "order", "update", "insert", "delete"]) {
    builderMethods[name] = vi.fn(() => chain);
    chain[name] = builderMethods[name];
  }
  chain.single = singleMock;
  fromMock.mockReturnValue(chain);
});

describe("supabase-usuarios.repository.impl — listar", () => {
  it("(1) listar: queries 'usuarios_rol' table with .select('*').order('created_at', {ascending:false})", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: [makeRow()], error: null }),
    });

    const result = await usuariosRepository.listar();

    expect(fromMock).toHaveBeenCalledWith("usuarios_rol");
    expect(builderMethods.select).toHaveBeenCalledWith("*");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("user-row-1");
  });

  it("(2) listar: maps snake_case DB rows to camelCase VendedorProfile (telefono null → undefined)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) =>
        resolve({ data: [makeRow({ telefono: null })], error: null }),
    });

    const result = await usuariosRepository.listar();
    expect(result[0]?.telefono).toBeUndefined();
  });

  it("(3) listar: returns [] when data is null (no rows)", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
    });

    const result = await usuariosRepository.listar();
    expect(result).toEqual([]);
  });

  it("(4) listar: throws when supabase returns an error", async () => {
    Object.assign(chain, {
      then: (resolve: (v: unknown) => void) =>
        resolve({ data: null, error: { message: "RLS blocked" } }),
    });

    await expect(usuariosRepository.listar()).rejects.toThrow("RLS blocked");
  });
});

describe("supabase-usuarios.repository.impl — getById / getByAuthUserId", () => {
  it("(5) getById: returns mapped VendedorProfile on success", async () => {
    singleMock.mockResolvedValue({ data: makeRow({ id: "user-99" }), error: null });

    const result = await usuariosRepository.getById("user-99");
    expect(result?.id).toBe("user-99");
    expect(result?.email).toBe("vendedor@inmobiliaria.pe");
    expect(builderMethods.eq).toHaveBeenCalledWith("id", "user-99");
  });

  it("(6) getById: returns null on error (graceful, mirrors lotes.obtenerPorId pattern)", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "PGRST116" } });

    const result = await usuariosRepository.getById("missing");
    expect(result).toBeNull();
  });

  it("(7) getByAuthUserId: filters by auth_user_id column (NOT by id)", async () => {
    singleMock.mockResolvedValue({ data: makeRow({ auth_user_id: "auth-77" }), error: null });

    const result = await usuariosRepository.getByAuthUserId("auth-77");
    expect(result?.authUserId).toBe("auth-77");
    expect(builderMethods.eq).toHaveBeenCalledWith("auth_user_id", "auth-77");
  });
});

describe("supabase-usuarios.repository.impl — crear (via Edge Function)", () => {
  it("(8) crear: invokes the 'crear-vendedor' Edge Function with the full payload", async () => {
    functionsInvokeMock.mockResolvedValue({
      data: { usuarios_rol: makeRow({ email: "nuevo@inmobiliaria.pe" }) },
      error: null,
    });

    const result = await usuariosRepository.crear({
      email: "nuevo@inmobiliaria.pe",
      password: "temporal123",
      nombre: "Vendedor Nuevo",
      rol: "vendedor",
    });

    expect(functionsInvokeMock).toHaveBeenCalledWith(
      "crear-vendedor",
      expect.objectContaining({
        body: expect.objectContaining({
          email: "nuevo@inmobiliaria.pe",
          password: "temporal123",
          nombre: "Vendedor Nuevo",
          rol: "vendedor",
        }),
      }),
    );
    expect(result.email).toBe("nuevo@inmobiliaria.pe");
  });

  it("(9) crear: when the Edge Function returns an error envelope, the call falls back to the RPC", async () => {
    // The contract is: try Edge Function first, fall back to RPC on
    // any Edge Function error. The "throws when both fail" case is
    // covered by (9c) below.
    functionsInvokeMock.mockResolvedValue({
      data: null,
      error: { message: "FORBIDDEN — admin only" },
    });
    rpcMock.mockResolvedValue({
      data: makeRow({ email: "rpc-fallback@inmobiliaria.pe" }),
      error: null,
    });

    const result = await usuariosRepository.crear({
      email: "rpc-fallback@inmobiliaria.pe",
      password: "12345678",
      nombre: "X",
      rol: "vendedor",
    });

    expect(functionsInvokeMock).toHaveBeenCalled();
    expect(rpcMock).toHaveBeenCalled();
    expect(result.email).toBe("rpc-fallback@inmobiliaria.pe");
  });

  it("(9b) crear: falls back to the 'crear_vendedor' RPC when the Edge Function errors (T-5.2 fallback)", async () => {
    // Edge Function not deployed (typical Supabase project without
    // Edge Functions enabled). The functions.invoke call resolves
    // with an error envelope — the repo MUST then try the RPC.
    functionsInvokeMock.mockResolvedValue({
      data: null,
      error: { message: "Function not found" },
    });
    rpcMock.mockResolvedValue({
      data: makeRow({ email: "fallback@inmobiliaria.pe" }),
      error: null,
    });

    const result = await usuariosRepository.crear({
      email: "fallback@inmobiliaria.pe",
      password: "temporal123",
      nombre: "Vendedor Fallback",
      rol: "vendedor",
    });

    expect(functionsInvokeMock).toHaveBeenCalledWith(
      "crear-vendedor",
      expect.objectContaining({ body: expect.any(Object) }),
    );
    expect(rpcMock).toHaveBeenCalledWith(
      "crear_vendedor",
      expect.objectContaining({
        p_email: "fallback@inmobiliaria.pe",
        p_password: "temporal123",
        p_nombre: "Vendedor Fallback",
        p_rol: "vendedor",
      }),
    );
    expect(result.email).toBe("fallback@inmobiliaria.pe");
  });

  it("(9c) crear: rethrows the original Edge Function error if BOTH Edge Function and RPC fail (defense in depth)", async () => {
    functionsInvokeMock.mockResolvedValue({
      data: null,
      error: { message: "FunctionsInvokeError [404]" },
    });
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "function crear_vendedor does not exist" },
    });

    await expect(
      usuariosRepository.crear({
        email: "x@x.com",
        password: "12345678",
        nombre: "X",
        rol: "vendedor",
      }),
    ).rejects.toThrow("FunctionsInvokeError [404]");
  });
});

describe("supabase-usuarios.repository.impl — actualizar / desactivar", () => {
  it("(10) actualizar: forwards only defined fields as snake_case to the UPDATE", async () => {
    singleMock.mockResolvedValue({ data: makeRow(), error: null });

    await usuariosRepository.actualizar("user-1", { telefono: "+51999000999", activo: false });

    expect(builderMethods.update).toHaveBeenCalledWith({
      telefono: "+51999000999",
      activo: false,
    });
    expect(builderMethods.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("(11) actualizar: never forwards 'rol' even if a caller passes it (defense in depth)", async () => {
    singleMock.mockResolvedValue({ data: makeRow(), error: null });

    // The TS layer already prevents this, but if a caller manages to
    // bypass TS (e.g. via `as any` from JS), the repo must drop `rol`.
    await usuariosRepository.actualizar(
      "user-1",
      // @ts-expect-error rol is not assignable, intentional defense in depth
      { telefono: "+51", rol: "admin" },
    );

    const updateArg = builderMethods.update!.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(updateArg).not.toHaveProperty("rol");
    expect(updateArg).toEqual({ telefono: "+51" });
  });

  it("(12) desactivar: sets activo = false via a single PATCH update", async () => {
    singleMock.mockResolvedValue({ data: makeRow({ activo: false }), error: null });

    const result = await usuariosRepository.desactivar("user-1");

    expect(builderMethods.update).toHaveBeenCalledWith({ activo: false });
    expect(builderMethods.eq).toHaveBeenCalledWith("id", "user-1");
    expect(result.activo).toBe(false);
  });
});

// Quick smoke that the repo also exists and the barrel exports work.
describe("supabase-usuarios.repository.impl — module wiring", () => {
  it("(13) usuariosRepository is a singleton object with all 6 methods", () => {
    expect(typeof usuariosRepository.listar).toBe("function");
    expect(typeof usuariosRepository.getById).toBe("function");
    expect(typeof usuariosRepository.getByAuthUserId).toBe("function");
    expect(typeof usuariosRepository.crear).toBe("function");
    expect(typeof usuariosRepository.actualizar).toBe("function");
    expect(typeof usuariosRepository.desactivar).toBe("function");
  });

  it("(14) mapRowToVendedor (sanity for the mapping helper)", () => {
    const mapped = mapRowToVendedor(makeRow({ telefono: null }));
    expect(mapped.telefono).toBeUndefined();
    expect(mapped.rol).toBe("vendedor");
  });
});
