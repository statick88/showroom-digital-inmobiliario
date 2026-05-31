-- ============================================================
-- SHOWROOM LOTIZACIÓN — Schema para Ayacucho
-- ============================================================

-- 1. NUEVOS ENUMS
create type public.estado_lote as enum ('disponible', 'reservado', 'vendido');
create type public.rol_usuario_v2 as enum ('admin', 'vendedor', 'comprador');
create type public.tipo_transaccion as enum ('reserva', 'venta');

-- 2. TABLA PROYECTOS
-- Reemplaza el modelo de agencia única. Un proyecto = un desarrollo inmobiliario.
create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  ubicacion text,                          -- Dirección textual
  coordenadas_centro jsonb,                -- {lat, lng} para centrar mapa
  imagen_hero text,                        -- URL imagen principal
  imagenes_360 jsonb default '[]'::jsonb,  -- URLs imágenes Pannellum
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. TABLA LOTES (core del sistema)
-- Cada lote pertenece a un proyecto, tiene coordenadas de polígono para dibujar en el mapa.
create table public.lotes (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  codigo text not null,                    -- "Lote 127", "MZ-A LT-3"
  area_total numeric(10,2) not null,       -- m²
  frente numeric(10,2),                    -- frente en metros lineales
  fondo numeric(10,2),                     -- fondo en metros lineales
  precio numeric(12,2) not null,
  moneda text not null default 'PEN' check (moneda in ('PEN', 'USD')),
  estado public.estado_lote not null default 'disponible',
  poligono_coords jsonb not null,          -- GeoJSON Polygon [[lng,lat],...]
  imagen_plano text,                       -- URL plano/ficha técnica
  descripcion text,
  orden integer default 0,                 -- Para ordenar visualmente
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. TABLA USUARIOS_ROL (reemplaza perfiles para este contexto)
-- Vinculada a auth.users, simplificada para lotización.
create table public.usuarios_rol (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  email text not null,
  nombre text not null,
  rol public.rol_usuario_v2 not null default 'comprador',
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. TABLA TRANSACCIONES (reemplaza leads)
-- Registra reservas y ventas de lotes.
create table public.transacciones (
  id uuid primary key default gen_random_uuid(),
  lote_id uuid not null references public.lotes(id) on delete cascade,
  tipo public.tipo_transaccion not null,
  comprador_nombre text not null,
  comprador_documento text,                -- DNI/CE
  comprador_email text,
  comprador_telefono text,
  monto numeric(12,2) not null,
  moneda text not null default 'PEN' check (moneda in ('PEN', 'USD')),
  id_vendedor uuid references public.usuarios_rol(id) on delete set null,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. MIGRACIÓN DE DATOS EXISTENTES
-- Crear proyecto default con datos de agencia actual
insert into public.proyectos (nombre, descripcion, activo)
select nombre, 'Proyecto migrado', true
from public.agencias
limit 1;

-- Migrar lotes existentes (tipo = 'lote' o 'terreno')
insert into public.lotes (proyecto_id, codigo, area_total, precio, moneda, estado, poligono_coords, created_at, updated_at)
select
  (select id from public.proyectos limit 1),
  codigo,
  coalesce(area_m2, 0),
  precio,
  moneda,
  case estado
    when 'disponible' then 'disponible'::estado_lote
    when 'separado' then 'reservado'::estado_lote
    when 'vendido' then 'vendido'::estado_lote
  end,
  -- Convertir point a GeoJSON polygon (aproximación de 4 puntos alrededor del point)
  jsonb_build_array(
    jsonb_build_array(
      jsonb_build_array(ST_X(ubicacion::geometry) - 0.0001, ST_Y(ubicacion::geometry) - 0.0001),
      jsonb_build_array(ST_X(ubicacion::geometry) + 0.0001, ST_Y(ubicacion::geometry) - 0.0001),
      jsonb_build_array(ST_X(ubicacion::geometry) + 0.0001, ST_Y(ubicacion::geometry) + 0.0001),
      jsonb_build_array(ST_X(ubicacion::geometry) - 0.0001, ST_Y(ubicacion::geometry) + 0.0001),
      jsonb_build_array(ST_X(ubicacion::geometry) - 0.0001, ST_Y(ubicacion::geometry) - 0.0001)
    )
  ),
  created_at,
  updated_at
from public.propiedades
where tipo in ('lote', 'terreno');

-- 7. ÍNDICES
create index idx_lotes_proyecto on public.lotes(proyecto_id);
create index idx_lotes_estado on public.lotes(estado);
create index idx_lotes_codigo on public.lotes(codigo);
create index idx_transacciones_lote on public.transacciones(lote_id);
create index idx_transacciones_fecha on public.transacciones(created_at);
create index idx_usuarios_rol_auth on public.usuarios_rol(auth_user_id);

-- 8. RLS POLICIES

-- Proyectos: lectura pública, escritura solo admin
alter table public.proyectos enable row level security;
create policy "proyectos_select_all" on public.proyectos for select using (activo = true);
create policy "proyectos_insert_admin" on public.proyectos for insert with check (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
);
create policy "proyectos_update_admin" on public.proyectos for update using (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
);

-- Lotes: lectura pública, escritura admin/vendedor
alter table public.lotes enable row level security;
create policy "lotes_select_all" on public.lotes for select using (true);
create policy "lotes_insert_admin" on public.lotes for insert with check (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor'))
);
create policy "lotes_update_admin" on public.lotes for update using (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor'))
);

-- Transacciones: lectura admin/vendedor, inserción admin
alter table public.transacciones enable row level security;
create policy "transacciones_select_staff" on public.transacciones for select using (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol in ('admin', 'vendedor'))
);
create policy "transacciones_insert_admin" on public.transacciones for insert with check (
  exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
);

-- Usuarios: cada quien su perfil, admin ve todo
alter table public.usuarios_rol enable row level security;
create policy "usuarios_rol_select_own" on public.usuarios_rol for select using (
  auth_user_id = auth.uid()
  or exists (select 1 from public.usuarios_rol where auth_user_id = auth.uid() and rol = 'admin')
);
create policy "usuarios_rol_update_own" on public.usuarios_rol for update using (auth_user_id = auth.uid());

-- 9. FUNCIONES

-- Obtener métricas de dashboard para admin
create or replace function public.obtener_metricas_lotes(p_proyecto_id uuid)
returns table (
  total_lotes bigint,
  disponibles bigint,
  reservados bigint,
  vendidos bigint,
  total_transacciones bigint,
  avance_porcentaje numeric,
  total_ventas_pen numeric,
  total_ventas_usd numeric
)
language sql
stable
set search_path = ''
as $$
  select
    count(*)::bigint as total_lotes,
    count(*) filter (where estado = 'disponible')::bigint as disponibles,
    count(*) filter (where estado = 'reservado')::bigint as reservados,
    count(*) filter (where estado = 'vendido')::bigint as vendidos,
    coalesce((select count(*) from public.transacciones t join public.lotes l on t.lote_id = l.id where l.proyecto_id = p_proyecto_id), 0)::bigint as total_transacciones,
    case
      when count(*) > 0 then
        round(((count(*) filter (where estado in ('reservado', 'vendido')))::numeric / count(*)::numeric) * 100, 1)
      else 0
    end as avance_porcentaje,
    coalesce((select sum(t.monto) from public.transacciones t join public.lotes l on t.lote_id = l.id where l.proyecto_id = p_proyecto_id and t.moneda = 'PEN'), 0) as total_ventas_pen,
    coalesce((select sum(t.monto) from public.transacciones t join public.lotes l on t.lote_id = l.id where l.proyecto_id = p_proyecto_id and t.moneda = 'USD'), 0) as total_ventas_usd
  from public.lotes
  where proyecto_id = p_proyecto_id;
$$;

-- 10. TRIGGER updated_at
create trigger set_updated_at_proyectos before update on public.proyectos
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_lotes before update on public.lotes
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_usuarios_rol before update on public.usuarios_rol
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_transacciones before update on public.transacciones
  for each row execute function public.handle_updated_at();
