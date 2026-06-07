-- ============================================================
-- SHOWROOM LOTIZACIÓN — Usuarios_Rol Extensions (PR-5 / HU-009)
-- Migration: 00013
-- ============================================================
-- Purpose:
--   Add proyecto_id (FK to proyectos) and dni columns to usuarios_rol
--   for vendedor management. Includes unique constraint on
--   (proyecto_id, dni) to enforce unique DNI per project.
--
-- Rollback:
--   ALTER TABLE public.usuarios_rol DROP CONSTRAINT IF EXISTS uq_usuarios_rol_proyecto_dni;
--   ALTER TABLE public.usuarios_rol DROP CONSTRAINT IF EXISTS fk_usuarios_rol_proyecto;
--   ALTER TABLE public.usuarios_rol DROP COLUMN IF EXISTS proyecto_id;
--   ALTER TABLE public.usuarios_rol DROP COLUMN IF EXISTS dni;
-- ============================================================

-- 1. ADD COLUMNAS (nullable para compatibilidad con filas existentes)
alter table public.usuarios_rol
  add column if not exists proyecto_id uuid references public.proyectos(id) on delete set null,
  add column if not exists dni varchar(20);

-- 2. NOMBRAR FK CONSTRAINT (explícito para rollback y debugging)
alter table public.usuarios_rol
  drop constraint if exists fk_usuarios_rol_proyecto;

alter table public.usuarios_rol
  add constraint fk_usuarios_rol_proyecto
  foreign key (proyecto_id) references public.proyectos(id) on delete set null;

-- 3. UNIQUE CONSTRAINT: DNI único por proyecto
-- Solo aplica cuando ambos campos no son null (partial index)
alter table public.usuarios_rol
  drop constraint if exists uq_usuarios_rol_proyecto_dni;

create unique index uq_usuarios_rol_proyecto_dni
  on public.usuarios_rol (proyecto_id, dni)
  where proyecto_id is not null and dni is not null;

-- 4. ÍNDICE para consultas por proyecto_id
create index if not exists idx_usuarios_rol_proyecto
  on public.usuarios_rol (proyecto_id);

-- 5. ÍNDICE para consultas por dni
create index if not exists idx_usuarios_rol_dni
  on public.usuarios_rol (dni);

-- 6. VERIFICACIÓN: filas existentes preservadas, nuevas columnas NULL
do $$
declare
  v_count integer;
  v_null_proyecto integer;
  v_null_dni integer;
begin
  select count(*) into v_count from public.usuarios_rol;
  select count(*) into v_null_proyecto from public.usuarios_rol where proyecto_id is null;
  select count(*) into v_null_dni from public.usuarios_rol where dni is null;

  raise notice '=== VERIFICACIÓN MIGRACIÓN 00013 ===';
  raise notice 'Total filas usuarios_rol:     %', v_count;
  raise notice 'Filas con proyecto_id NULL:   %', v_null_proyecto;
  raise notice 'Filas con dni NULL:           %', v_null_dni;

  if v_count = v_null_proyecto and v_count = v_null_dni then
    raise notice 'OK: Todas las filas existentes tienen proyecto_id y dni = NULL';
  else
    raise warning 'Atención: Algunas filas tienen valores no-NULL en columnas nuevas';
  end if;
end $$;

-- 7. COMENTARIOS
comment on column public.usuarios_rol.proyecto_id is
  'FK to proyectos.id — defines which project this vendedor belongs to. '
  'Nullable for backward compatibility with pre-migration rows. '
  'Required for rol = vendedor at application level.';

comment on column public.usuarios_rol.dni is
  'Documento Nacional de Identidad (Perú) — 8 digits for DNI. '
  'Required for rol = vendedor. Unique per proyecto via uq_usuarios_rol_proyecto_dni. '
  'Nullable for backward compatibility and non-vendedor roles.';

comment on constraint fk_usuarios_rol_proyecto on public.usuarios_rol is
  'Foreign key to proyectos table. On delete SET NULL to preserve vendedor row.';

comment on index uq_usuarios_rol_proyecto_dni is
  'Partial unique index: ensures DNI is unique within a project. '
  'Allows same DNI in different projects (e.g., vendedor works for multiple projects). '
  'Only applies when both proyecto_id and dni are non-NULL.';

comment on index idx_usuarios_rol_proyecto is 'Index for querying vendedores by proyecto_id';
comment on index idx_usuarios_rol_dni is 'Index for querying vendedores by dni';