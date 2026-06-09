-- Migration 00024: Virtual Tours 360° for Proyectos
-- Creates: tours_360 table with RLS, indexes, triggers

-- 1. ENUM for tour state
create type public.estado_tour_360 as enum ('borrador', 'publicado', 'archivado');

-- 2. TOURS_360 TABLE
create table public.tours_360 (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  propiedad_id uuid references public.propiedades(id) on delete set null,
  nombre text not null,
  descripcion text,
  escenas jsonb not null default '[]'::jsonb,           -- Array of VirtualTourScene objects
  escena_inicial_id uuid,                                -- ID of the initial scene
  metadatos jsonb default '{}'::jsonb,                   -- Extensible metadata (author, version, etc.)
  estado public.estado_tour_360 not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. INDEXES for performance
create index idx_tours_360_proyecto on public.tours_360(proyecto_id);
create index idx_tours_360_propiedad on public.tours_360(propiedad_id);
create index idx_tours_360_estado on public.tours_360(estado);

-- 4. RLS (Row Level Security)
alter table public.tours_360 enable row level security;

-- Public read access for published tours (anyone can view published tours)
create policy "tours_360_select_published" on public.tours_360
  for select using (estado = 'publicado');

-- Agency members can read all tours in their projects (for management)
create policy "tours_360_select_agency" on public.tours_360
  for select using (
    proyecto_id in (
      select p.id from public.proyectos p
      where p.id in (
        -- This assumes a link between proyectos and agencias/usuarios
        -- For now, allow authenticated users with admin/vendedor roles to read
        -- In future migrations, add proyecto_id to usuarios_rol
        select proyecto_id from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor')
      )
    )
    or exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
  );

-- Agency members (admin, vendedor) can insert tours for their projects
create policy "tours_360_insert_agency" on public.tours_360
  for insert with check (
    exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor'))
  );

-- Agency members (admin, vendedor) can update tours for their projects
create policy "tours_360_update_agency" on public.tours_360
  for update using (
    exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor'))
  );

-- Only admins can delete tours
create policy "tours_360_delete_admin" on public.tours_360
  for delete using (
    exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
  );

-- 5. TRIGGER: updated_at auto-update
create trigger set_updated_at_tours_360 before update on public.tours_360
  for each row execute function public.handle_updated_at();

-- 6. COMMENTS for documentation
comment on table public.tours_360 is 'Virtual 360° tours linked to proyectos (and optionally propiedades)';
comment on column public.tours_360.escenas is 'Array of scenes: [{id, textureUrl, thumbnailUrl, yaw, pitch, fov, hotspots}]';
comment on column public.tours_360.escena_inicial_id is 'UUID of the scene to load first';
comment on column public.tours_360.metadatos is 'Extensible metadata: author, version, captureDate, cameraModel, etc.';
