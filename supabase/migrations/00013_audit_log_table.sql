-- ============================================================
-- SHOWROOM LOTIZACIÓN — Audit Log Table (PR-5 / HU-009)
-- Migration: 00011
-- ============================================================
-- Purpose:
--   Create the central audit_log table for capturing all
--   INSERT/UPDATE/DELETE operations on key business tables.
--   Includes indexes for query performance and RLS policies
--   for admin access control.
--
-- Rollback:
--   DROP TABLE IF EXISTS public.audit_log CASCADE;
--   DROP TYPE IF EXISTS public.audit_actor_tipo;
-- ============================================================

-- 1. ENUM para tipo de actor
create type public.audit_actor_tipo as enum ('admin', 'asesor', 'system', 'edge_function');

-- 2. TABLA AUDIT_LOG
create table public.audit_log (
  id bigint primary key generated always as identity,
  tabla text not null,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  actor_tipo public.audit_actor_tipo not null default 'system',
  valores_anteriores jsonb,
  valores_nuevos jsonb,
  metadatos jsonb,
  created_at timestamptz not null default now()
);

-- 3. ÍNDICES para performance de consultas
create index idx_audit_log_tabla_accion on public.audit_log (tabla, accion);
create index idx_audit_log_actor_created on public.audit_log (actor_id, created_at desc);
create index idx_audit_log_tabla_created on public.audit_log (tabla, created_at desc);

-- 4. RLS POLICIES
alter table public.audit_log enable row level security;

-- Admin puede leer todo el log de auditoría
create policy "audit_log_select_admin" on public.audit_log
  for select using (
    exists (
      select 1 from public.usuarios_rol
      where auth_user_id = auth.uid()
        and rol = 'admin'
        and activo = true
    )
  );

-- Service role tiene acceso completo (para triggers y edge functions)
create policy "audit_log_service_role_all" on public.audit_log
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 5. COMENTARIOS
comment on table public.audit_log is
  'Central audit log for all INSERT/UPDATE/DELETE on business tables. '
  'Populated by audit_trigger_fn() attached to 7 tables. '
  'Readable only by admin role; service_role has full access.';

comment on column public.audit_log.tabla is 'Source table name (e.g., lotes, proyectos, usuarios_rol)';
comment on column public.audit_log.accion is 'Operation type: INSERT, UPDATE, or DELETE';
comment on column public.audit_log.actor_id is 'Authenticated user ID from request JWT (nullable for system actions)';
comment on column public.audit_log.actor_tipo is 'Actor type: admin, asesor, system, or edge_function';
comment on column public.audit_log.valores_anteriores is 'Full row before change (null for INSERT)';
comment on column public.audit_log.valores_nuevos is 'Full row after change (null for DELETE)';
comment on column public.audit_log.metadatos is 'Additional context: request_id, ip, user_agent, etc.';
comment on column public.audit_log.created_at is 'Timestamp when audit entry was created';