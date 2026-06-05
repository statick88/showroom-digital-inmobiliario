// ============================================================
//  Edge Function: crear-vendedor (T-5.2, HU-009)
// ============================================================
//
// Purpose:
//   Server-side handler for the admin "Crear vendedor" form. The
//   browser cannot call `auth.admin.createUser` (it would expose the
//   service-role key), so the form invokes this Edge Function instead.
//
//   The function:
//     1. Validates the caller's JWT.
//     2. Verifies the caller has `rol = 'admin'` in `usuarios_rol`.
//     3. Uses the service-role key to create the matching `auth.users` row.
//     4. Inserts the corresponding `usuarios_rol` row.
//     5. Returns the new row (mapped to the same shape as the rest of
//        the API) or a structured error.
//
// Fallback:
//   If Edge Functions are not enabled on the Supabase project, the
//   `crear` method in `supabase-usuarios.repository.impl.ts` falls
//   back to the `crear_vendedor` RPC function (see
//   `supabase/migrations/00010_crear_vendedor_rpc.sql`). The RPC
//   re-implements the same RLS check + transactional insert, so
//   either path is safe.
//
// Environment:
//   - SUPABASE_URL              — set automatically by Supabase
//   - SUPABASE_ANON_KEY         — set automatically by Supabase
//   - SUPABASE_SERVICE_ROLE_KEY — set automatically by Supabase
//
// Reference: design #2669, T-5.2 acceptance criteria.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const ROLES = ["admin", "vendedor", "comprador"] as const;
type Rol = (typeof ROLES)[number];

interface CrearVendedorPayload {
  email?: unknown;
  password?: unknown;
  nombre?: unknown;
  rol?: unknown;
  telefono?: unknown;
  proyectoId?: unknown;
  dni?: unknown;
}

const PHONE_RE = /^\+\d{7,15}$/;
const DNI_RE = /^\d{8}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fail(message: string, code: string, status = 400): Response {
  return json({ error: { message, code } }, status);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return fail("Método no permitido", "method_not_allowed", 405);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return fail("Token de autorización requerido", "no_auth", 401);
  }
  const jwt = authHeader.replace(/^Bearer\s+/i, "");

  // 1. Decode caller with anon client (no service-role).
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !anonKey) {
    return fail("Configuración de Supabase faltante", "misconfigured", 500);
  }
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await callerClient.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return fail("Token inválido", "invalid_token", 401);
  }
  const callerAuthId = userData.user.id;

  // 2. Verify caller is admin in usuarios_rol.
  const { data: callerRow, error: callerRowErr } = await callerClient
    .from("usuarios_rol")
    .select("id, rol, activo")
    .eq("auth_user_id", callerAuthId)
    .single();

  if (callerRowErr || !callerRow || callerRow.rol !== "admin" || !callerRow.activo) {
    return fail("Solo administradores pueden crear vendedores", "forbidden", 403);
  }

  // 3. Parse + validate the body.
  let payload: CrearVendedorPayload;
  try {
    payload = (await req.json()) as CrearVendedorPayload;
  } catch {
    return fail("JSON inválido", "bad_json", 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const nombre = typeof payload.nombre === "string" ? payload.nombre.trim() : "";
  const rol = typeof payload.rol === "string" && (ROLES as readonly string[]).includes(payload.rol)
    ? (payload.rol as Rol)
    : "vendedor";
  const telefono = typeof payload.telefono === "string" ? payload.telefono.trim() : null;
  const proyectoId = typeof payload.proyectoId === "string" ? payload.proyectoId.trim() : null;
  const dni = typeof payload.dni === "string" ? payload.dni.trim() : null;

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return fail("email inválido", "invalid_email", 422);
  }
  if (password.length < 8 || password.length > 72) {
    return fail("contraseña debe tener entre 8 y 72 caracteres", "invalid_password", 422);
  }
  if (!nombre) {
    return fail("nombre requerido", "invalid_nombre", 422);
  }
  if (telefono && !PHONE_RE.test(telefono)) {
    return fail("teléfono debe tener formato E.164", "invalid_telefono", 422);
  }
  if (dni && !DNI_RE.test(dni)) {
    return fail("DNI debe tener 8 dígitos", "invalid_dni", 422);
  }
  if (proyectoId && !UUID_RE.test(proyectoId)) {
    return fail("proyectoId debe ser un UUID", "invalid_proyecto", 422);
  }

  // 4. Use service-role client to create the auth.users row.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return fail("Falta SUPABASE_SERVICE_ROLE_KEY", "misconfigured", 500);
  }
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !created?.user) {
    return fail(
      createErr?.message ?? "No se pudo crear el usuario en auth.users",
      "auth_create_failed",
      500,
    );
  }

  const authUserId = created.user.id;

  // 5. Insert the usuarios_rol row.
  const { data: row, error: insertErr } = await adminClient
    .from("usuarios_rol")
    .insert({
      auth_user_id: authUserId,
      email,
      nombre,
      rol,
      telefono,
      activo: true,
    })
    .select("*")
    .single();

  if (insertErr || !row) {
    // Best-effort cleanup: delete the auth.users row so the email is freed.
    await adminClient.auth.admin.deleteUser(authUserId).catch(() => {});
    return fail(
      insertErr?.message ?? "No se pudo crear la fila en usuarios_rol",
      "db_insert_failed",
      500,
    );
  }

  return json({ usuarios_rol: row });
});
