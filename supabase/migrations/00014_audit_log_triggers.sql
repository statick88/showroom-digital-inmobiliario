-- ============================================================
-- SHOWROOM LOTIZACIÓN — Audit Trigger Function & 7 Triggers (PR-5 / HU-009)
-- Migration: 00012
-- ============================================================
-- Purpose:
--   Create the audit_trigger_fn() function that captures
--   INSERT/UPDATE/DELETE operations and writes to audit_log.
--   Attach it to 7 business tables with AFTER triggers.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS audit_trigger_lotes ON public.lotes;
--   DROP TRIGGER IF EXISTS audit_trigger_proyectos ON public.proyectos;
--   DROP TRIGGER IF EXISTS audit_trigger_leads ON public.leads;
--   DROP TRIGGER IF EXISTS audit_trigger_transacciones ON public.transacciones;
--   DROP TRIGGER IF EXISTS audit_trigger_usuarios_rol ON public.usuarios_rol;
--   DROP TRIGGER IF EXISTS audit_trigger_vendedores_profile ON public.vendedores_profile;
--   DROP TRIGGER IF EXISTS audit_trigger_cci_validaciones ON public.cci_validaciones;
--   DROP FUNCTION IF EXISTS public.audit_trigger_fn();
-- ============================================================

-- 1. FUNCIÓN DE TRIGGER AUDIT
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_tipo public.audit_actor_tipo := 'system';
  v_metadatos jsonb := '{}'::jsonb;
  v_old jsonb;
  v_new jsonb;
  v_jwt jsonb;
  v_claims jsonb;
  v_rol text;
begin
  -- Extract actor info from request JWT (available via request.jwt.claims)
  -- NOTE: In Supabase, auth.uid() returns the JWT subject.
  -- For service_role calls, auth.uid() is null but we can check auth.role().
  v_actor_id := auth.uid();

  if v_actor_id is not null then
    -- Try to determine actor_tipo from usuarios_rol
    begin
      select ur.rol into v_rol
      from public.usuarios_rol ur
      where ur.auth_user_id = v_actor_id
        and ur.activo = true
      limit 1;

      if v_rol is not null then
        case v_rol
          when 'admin' then v_actor_tipo := 'admin';
          when 'vendedor' then v_actor_tipo := 'asesor';
          when 'comprador' then v_actor_tipo := 'asesor';
          else v_actor_tipo := 'system';
        end case;
      end if;
    exception when others then
      -- If lookup fails, default to 'system'
      v_actor_tipo := 'system';
    end;
  else
    -- Check if called from service_role (edge function context)
    if current_setting('role', true) = 'service_role' then
      v_actor_tipo := 'edge_function';
    else
      v_actor_tipo := 'system';
    end if;
  end if;

  -- Build metadatos with available context
  v_metadatos := jsonb_build_object(
    'request_id', coalesce(current_setting('request.id', true), ''),
    'ip', coalesce(current_setting('request.client_ip', true), ''),
    'user_agent', coalesce(current_setting('request.user_agent', true), ''),
    'session_user', current_user
  );

  -- Convert OLD and NEW to JSONB
  if TG_OP = 'INSERT' then
    v_old := null;
    v_new := to_jsonb(NEW);
  elsif TG_OP = 'UPDATE' then
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  elsif TG_OP = 'DELETE' then
    v_old := to_jsonb(OLD);
    v_new := null;
  end if;

  -- Insert audit log entry
  insert into public.audit_log (
    tabla,
    accion,
    actor_id,
    actor_tipo,
    valores_anteriores,
    valores_nuevos,
    metadatos
  ) values (
    TG_TABLE_NAME,
    TG_OP,
    v_actor_id,
    v_actor_tipo,
    v_old,
    v_new,
    v_metadatos
  );

  -- Return appropriate value for trigger type
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- 2. TRIGGERS EN 7 TABLAS
-- Cada trigger se dispara AFTER INSERT OR UPDATE OR DELETE FOR EACH ROW

-- lotes
create trigger audit_trigger_lotes
  after insert or update or delete on public.lotes
  for each row execute function public.audit_trigger_fn();

-- proyectos
create trigger audit_trigger_proyectos
  after insert or update or delete on public.proyectos
  for each row execute function public.audit_trigger_fn();

-- leads
create trigger audit_trigger_leads
  after insert or update or delete on public.leads
  for each row execute function public.audit_trigger_fn();

-- transacciones
create trigger audit_trigger_transacciones
  after insert or update or delete on public.transacciones
  for each row execute function public.audit_trigger_fn();

-- usuarios_rol
create trigger audit_trigger_usuarios_rol
  after insert or update or delete on public.usuarios_rol
  for each row execute function public.audit_trigger_fn();

-- vendedores_profile (si existe, se crea condicionalmente)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vendedores_profile') then
    execute 'create trigger audit_trigger_vendedores_profile
      after insert or update or delete on public.vendedores_profile
      for each row execute function public.audit_trigger_fn()';
  end if;
end $$;

-- cci_validaciones (si existe, se crea condicionalmente)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'cci_validaciones') then
    execute 'create trigger audit_trigger_cci_validaciones
      after insert or update or delete on public.cci_validaciones
      for each row execute function public.audit_trigger_fn()';
  end if;
end $$;

-- 3. COMENTARIOS
comment on function public.audit_trigger_fn() is
  'Universal audit trigger function. Captures INSERT/UPDATE/DELETE on attached tables '
  'and writes to audit_log with actor context from JWT, full row diffs, and request metadata. '
  'SECURITY DEFINER so it can read usuarios_rol for actor_tipo determination even when '
  'RLS would block the calling user. Attached to 7 business tables via AFTER triggers.';

comment on trigger audit_trigger_lotes on public.lotes is 'Audit log trigger for lotes table';
comment on trigger audit_trigger_proyectos on public.proyectos is 'Audit log trigger for proyectos table';
comment on trigger audit_trigger_leads on public.leads is 'Audit log trigger for leads table';
comment on trigger audit_trigger_transacciones on public.transacciones is 'Audit log trigger for transacciones table';
comment on trigger audit_trigger_usuarios_rol on public.usuarios_rol is 'Audit log trigger for usuarios_rol table';