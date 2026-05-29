-- ============================================================
-- SHOWROOM DIGITAL INMOBILIARIO — Schema Inicial
-- ============================================================

-- 1. EXTENSIONES
create extension if not exists "pgcrypto";

-- 2. ENUMS
create type public.rol_usuario as enum ('admin', 'agente', 'comprador');
create type public.estado_propiedad as enum ('disponible', 'separado', 'vendido');
create type public.tipo_propiedad as enum ('lote', 'departamento', 'casa', 'local', 'oficina', 'terreno');
create type public.tipo_evento as enum ('click', 'favorito', 'contacto', 'vista_detalle');

-- 3. TABLAS

-- Agencias
create table public.agencias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  logo_url text,
  ruc text unique,
  direccion text,
  telefono text,
  plan text not null default 'gratis' check (plan in ('gratis', 'premium')),
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfiles de usuario (vinculados a Supabase Auth)
create table public.perfiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users on delete cascade,
  email text not null unique,
  nombre text not null,
  telefono text,
  avatar_url text,
  rol public.rol_usuario not null default 'comprador',
  agencia_id uuid references public.agencias(id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Propiedades
create table public.propiedades (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  tipo public.tipo_propiedad not null,
  estado public.estado_propiedad not null default 'disponible',
  precio numeric(12,2) not null,
  moneda text not null default 'PEN' check (moneda in ('PEN', 'USD')),
  titulo text not null,
  descripcion text,
  area_m2 numeric(10,2),
  cuartos integer,
  banios integer,
  ubicacion point,
  direccion text,
  distrito text,
  ciudad text not null default 'Lima',
  imagenes jsonb default '[]'::jsonb,
  svg_id text,
  agencia_id uuid references public.agencias(id) on delete cascade,
  publicada boolean not null default false,
  destacada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Métricas de clics
create table public.metricas_clicks (
  id bigint primary key generated always as identity,
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  tipo_evento public.tipo_evento not null default 'click',
  sesion_id text,
  perfil_id uuid references public.perfiles(id) on delete set null,
  pagina_origen text,
  created_at timestamptz not null default now()
);

-- Leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references public.propiedades(id) on delete cascade,
  perfil_id uuid references public.perfiles(id) on delete set null,
  nombre text not null,
  email text not null,
  telefono text,
  score integer not null default 0 check (score between 0 and 100),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'calificado', 'perdido', 'ganado')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. ÍNDICES
create index idx_propiedades_estado on public.propiedades(estado);
create index idx_propiedades_agencia on public.propiedades(agencia_id);
create index idx_propiedades_distrito on public.propiedades(distrito);
create index idx_propiedades_tipo on public.propiedades(tipo);
create index idx_propiedades_precio on public.propiedades(precio);
create index idx_metricas_clicks_propiedad on public.metricas_clicks(propiedad_id);
create index idx_metricas_clicks_tipo on public.metricas_clicks(tipo_evento);
create index idx_metricas_clicks_created on public.metricas_clicks(created_at);
create index idx_leads_propiedad on public.leads(propiedad_id);
create index idx_leads_score on public.leads(score);
create index idx_perfiles_agencia on public.perfiles(agencia_id);
create index idx_perfiles_rol on public.perfiles(rol);

-- 5. RLS (Row Level Security)
alter table public.agencias enable row level security;
alter table public.perfiles enable row level security;
alter table public.propiedades enable row level security;
alter table public.metricas_clicks enable row level security;
alter table public.leads enable row level security;

-- Agencias: solo ven su propia agencia
create policy "agencias_select_own" on public.agencias
  for select using (
    id in (select agencia_id from public.perfiles where auth_user_id = auth.uid())
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

-- Perfiles: cada uno ve su propio perfil; admin ve todos
create policy "perfiles_select_own" on public.perfiles
  for select using (
    auth_user_id = auth.uid()
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

create policy "perfiles_insert_own" on public.perfiles
  for insert with check (auth_user_id = auth.uid());

create policy "perfiles_update_own" on public.perfiles
  for update using (auth_user_id = auth.uid());

-- Propiedades: públicas para lectura (usuarios autenticados), escritura solo agente/admin
create policy "propiedades_select_all" on public.propiedades
  for select using (true);

create policy "propiedades_insert_agencia" on public.propiedades
  for insert with check (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

create policy "propiedades_update_agencia" on public.propiedades
  for update using (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

create policy "propiedades_delete_agencia" on public.propiedades
  for delete using (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

-- Métricas: insert público autenticado; solo admin/agente ve sus métricas
create policy "metricas_insert_all" on public.metricas_clicks
  for insert with check (true);

create policy "metricas_select_agencia" on public.metricas_clicks
  for select using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

-- Leads: solo agente/admin de la agencia dueña de la propiedad
create policy "leads_insert_all" on public.leads
  for insert with check (true);

create policy "leads_select_agencia" on public.leads
  for select using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

create policy "leads_update_agencia" on public.leads
  for update using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or exists (select 1 from public.perfiles where auth_user_id = auth.uid() and rol = 'admin')
  );

-- 6. TRIGGERS: updated_at automático
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_agencias before update on public.agencias
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_perfiles before update on public.perfiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_propiedades before update on public.propiedades
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_leads before update on public.leads
  for each row execute function public.handle_updated_at();

-- 7. FUNCIONES ÚTILES
create or replace function public.obtener_top_clicks(p_agencia_id uuid, p_limite int default 10)
returns table (
  id uuid,
  codigo text,
  titulo text,
  tipo public.tipo_propiedad,
  estado public.estado_propiedad,
  precio numeric(12,2),
  distrito text,
  created_at timestamptz,
  total_clicks bigint
)
language sql
stable
set search_path = ''
as $$
  select
    p.id, p.codigo, p.titulo, p.tipo, p.estado, p.precio, p.distrito, p.created_at,
    count(mc.id)::bigint as total_clicks
  from public.propiedades p
  left join public.metricas_clicks mc on mc.propiedad_id = p.id
  where p.agencia_id = p_agencia_id
  group by p.id
  order by total_clicks desc
  limit p_limite;
$$;

create or replace function public.obtener_metricas_dashboard(p_agencia_id uuid)
returns table (
  total_propiedades bigint,
  disponibles bigint,
  separadas bigint,
  vendidas bigint,
  total_clicks bigint,
  total_leads bigint,
  avance_porcentaje numeric
)
language sql
stable
set search_path = ''
as $$
  select
    count(*)::bigint as total_propiedades,
    count(*) filter (where estado = 'disponible')::bigint as disponibles,
    count(*) filter (where estado = 'separado')::bigint as separadas,
    count(*) filter (where estado = 'vendido')::bigint as vendidas,
    coalesce((select count(*) from public.metricas_clicks mc join public.propiedades p on mc.propiedad_id = p.id where p.agencia_id = p_agencia_id), 0)::bigint as total_clicks,
    coalesce((select count(*) from public.leads l join public.propiedades p on l.propiedad_id = p.id where p.agencia_id = p_agencia_id), 0)::bigint as total_leads,
    case
      when count(*) > 0 then
        round(
          ((count(*) filter (where estado in ('separado', 'vendido')))::numeric / count(*)::numeric) * 100,
          1
        )
      else 0
    end as avance_porcentaje
  from public.propiedades
  where agencia_id = p_agencia_id;
$$;
