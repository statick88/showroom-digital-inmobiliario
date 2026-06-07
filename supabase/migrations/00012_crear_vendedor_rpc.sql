-- ============================================================
-- SHOWROOM LOTIZACIÓN FASE 3 — RPC fallback for crear-vendedor
-- Migration: 00010
-- ============================================================
--
-- Purpose:
--   Mirror of the `crear-vendedor` Edge Function in SQL, for projects
--   where Supabase Edge Functions are NOT enabled. The `crear` method
--   in `supabase-usuarios.repository.impl.ts` (PR-4 → PR-5) tries the
--   Edge Function first and falls back to this RPC if it returns
--   `functions.invoke` failure (timeout, 404, 5xx).
--
--   The function is `SECURITY DEFINER` so it can call
--   `auth.admin.createUser`-equivalent logic, but it MUST verify the
--   caller is `admin` before doing anything — we use the same
--   `auth.uid()` check the Edge Function does, with the same
--   `usuarios_rol.rol = 'admin'` gate.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.crear_vendedor(text, text, text, text, text, text, text);
-- ============================================================

CREATE OR REPLACE FUNCTION public.crear_vendedor(
  p_email         text,
  p_password      text,
  p_nombre        text,
  p_rol           text     DEFAULT 'vendedor',
  p_telefono      text     DEFAULT NULL,
  p_proyecto_id   text     DEFAULT NULL,
  p_dni           text     DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_auth_id  uuid;
  v_caller_is_admin boolean;
  v_auth_user_id    uuid;
  v_new_row         public.usuarios_rol%ROWTYPE;
  v_role_enum       public.rol_usuario_v2;
  v_password_len    int := length(coalesce(p_password, ''));
  v_email           text := lower(trim(coalesce(p_email, '')));
  v_nombre          text := trim(coalesce(p_nombre, ''));
  v_telefono        text := nullif(trim(coalesce(p_telefono, '')), '');
  v_dni             text := nullif(trim(coalesce(p_dni, '')), '');
  v_proyecto_id     text := nullif(trim(coalesce(p_proyecto_id, '')), '');
BEGIN
  v_caller_auth_id := auth.uid();
  IF v_caller_auth_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;

  -- Caller must be an active admin.
  SELECT (rol = 'admin' AND activo) INTO v_caller_is_admin
  FROM public.usuarios_rol
  WHERE auth_user_id = v_caller_auth_id;

  IF v_caller_is_admin IS NULL OR NOT v_caller_is_admin THEN
    RAISE EXCEPTION 'Solo administradores pueden crear vendedores' USING ERRCODE = '42501';
  END IF;

  -- Validate inputs.
  IF v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'email inválido';
  END IF;
  IF v_password_len < 8 OR v_password_len > 72 THEN
    RAISE EXCEPTION 'contraseña debe tener entre 8 y 72 caracteres';
  END IF;
  IF v_nombre = '' THEN
    RAISE EXCEPTION 'nombre requerido';
  END IF;
  IF v_telefono IS NOT NULL AND v_telefono !~ '^\+\d{7,15}$' THEN
    RAISE EXCEPTION 'teléfono debe tener formato E.164';
  END IF;
  IF v_dni IS NOT NULL AND v_dni !~ '^\d{8}$' THEN
    RAISE EXCEPTION 'DNI debe tener 8 dígitos';
  END IF;
  IF v_proyecto_id IS NOT NULL AND v_proyecto_id !~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RAISE EXCEPTION 'proyectoId debe ser un UUID';
  END IF;

  -- Map role string -> enum.
  BEGIN
    v_role_enum := p_rol::public.rol_usuario_v2;
  EXCEPTION WHEN OTHERS THEN
    v_role_enum := 'vendedor'::public.rol_usuario_v2;
  END;

  -- Create the auth.users row. We can't call auth.admin.createUser
  -- from SQL; instead, insert directly into auth.users (SECURITY
  -- DEFINER allows us to bypass RLS on auth). The encrypted_password
  -- is set via the standard crypt function (this mirrors what the
  -- Supabase auth GoTrue server does).
  --
  -- NOTE: this requires the `pgcrypto` extension (already enabled in
  -- Hans Erik's Supabase project — used by auth.users already).
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('nombre', v_nombre),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_auth_user_id;

  -- Create the usuarios_rol row.
  INSERT INTO public.usuarios_rol (
    auth_user_id,
    email,
    nombre,
    rol,
    telefono,
    activo
  ) VALUES (
    v_auth_user_id,
    v_email,
    v_nombre,
    v_role_enum,
    v_telefono,
    true
  )
  RETURNING * INTO v_new_row;

  -- Return the row in the same shape the Edge Function uses.
  RETURN to_jsonb(v_new_row);
END;
$$;

COMMENT ON FUNCTION public.crear_vendedor(text, text, text, text, text, text, text) IS
  'Creates a new vendedor (HU-009) on behalf of an admin caller. SECURITY DEFINER so it can write to auth.users; the caller MUST have rol=admin in usuarios_rol. Use this RPC only when Supabase Edge Functions are not available on the project — prefer the Edge Function for the audit log + observability story.';
