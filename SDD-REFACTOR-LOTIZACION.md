# SDD: Refactorización a Sistema de Lotización (Ayacucho, Perú)

> **Autor**: statick (Arquitecto)
> **Cliente**: Inmobiliaria de Ayacucho — lotización exclusiva
> **Target**: Usuarios mayores sin dominio tecnológico → UI ultra-simple
> **Base**: Stitch Andean Modernity design system (conservar)
> **Stack**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Supabase + shadcn/ui

---

## Fase 1: Análisis de Impacto

### 1.1 Estructura actual del proyecto

```
src/
├── App.tsx                          # Routing: #map / #admin
├── main.tsx                         # Entry point
├── globals.css                      # Stitch tokens + Tailwind
├── components/ui/                   # shadcn/ui primitives (11 archivos)
│   ├── badge.tsx, button.tsx, card.tsx, dialog.tsx, icon.tsx
│   ├── input.tsx, pagination.tsx, select.tsx, sonner.tsx
│   ├── status-chip.tsx, table.tsx
├── config/
│   ├── env.ts                       # VITE_AGENCIA_ID, etc.
│   ├── glass.css                    # Glassmorphism effects
│   └── markers.ts                   # getMarkerColor, createMarkerHtml
├── domain/
│   ├── entities/propiedad.ts        # Propiedad, Agencia, Perfil, Lead, MetricaClick, DashboardMetricas
│   └── repositories/propiedades.repository.ts  # Interfaces: PropiedadesRepository, MetricasRepository, LeadsRepository
├── data/
│   ├── datasources/                 # Vacío
│   ├── models/                      # Vacío  
│   └── repositories/
│       ├── index.ts                 # Exporta 3 repos
│       ├── propiedades.repository.impl.ts  # CRUD propiedades + dashboard
│       ├── leads.repository.impl.ts       # CRUD leads
│       └── metricas.repository.impl.ts    # Click tracking + top clicks
├── lib/
│   ├── icon-map.ts                  # Lucide → Material Symbol mapping
│   ├── utils.ts                     # cn() helper
│   └── supabase/
│       ├── client.ts                # Supabase createClient
│       └── errors.ts                # rethrow helpers
├── presentation/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # 497 líneas — dashboard, propiedades, leads tabs
│   │   │   └── AdminLogin.tsx       # Login con Supabase Auth
│   │   ├── map/
│   │   │   ├── MapView.tsx          # 165 líneas — main screen con Leaflet
│   │   │   ├── HeaderNav.tsx        # Nav simple
│   │   │   ├── HeroImage.tsx        # Hero de propiedad
│   │   │   ├── PropertyCard.tsx     # Card de listado
│   │   │   ├── PropertyList.tsx     # Lista de cards
│   │   │   ├── PropertyFilters.tsx  # Filtros complejos
│   │   │   ├── PropertyDetailPanel.tsx  # Slide-over detalle
│   │   │   ├── PropertyMarkers.tsx  # Leaflet Markers
│   │   │   ├── MarkerPopup.tsx      # Popup de marcador
│   │   │   ├── LeadForm.tsx         # Formulario de contacto
│   │   │   ├── MetricasPanel.tsx    # Dashboard rápido
│   │   │   ├── SpecsGrid.tsx        # Grid de specs
│   │   │   ├── Gallery.tsx          # Galería de imágenes
│   │   │   ├── GlassControls.tsx    # Controles glassmorphism
│   │   │   ├── MasterPlanOverlay.tsx # ImageOverlay del plano
│   │   │   ├── MapController.tsx    # FlyTo controller
│   │   │   └── PropertyCard.test.tsx, PropertyDetailPanel.test.tsx
│   │   └── providers.tsx            # React Query provider
│   ├── hooks/
│   │   ├── usePropiedades.ts        # useQuery propiedades
│   │   ├── useLeads.ts              # useQuery leads
│   │   ├── useMetricas.ts           # useQuery metricas
│   │   ├── useTopClicks.ts          # useQuery top clicks
│   │   └── useClickTracker.ts       # Mutation track clicks
│   ├── lib/
│   │   └── formatters.ts            # formatPrice
│   ├── navigation/                  # Vacío
│   └── screens/                     # Vacío
└── testing/
    ├── contrast.test.ts             # WCAG AA OKLCH contrast
    └── setup.ts
```

### 1.2 Schema actual Supabase

| Tabla | Columnas clave | Notas |
|-------|---------------|-------|
| `agencias` | id, nombre, logo_url, ruc, plan (gratis/premium), activa | Se mantiene |
| `perfiles` | id, auth_user_id, email, nombre, rol (admin/agente/comprador), agencia_id | Roles cambian |
| `propiedades` | id, codigo, tipo (enum: lote/departamento/casa/local/oficina/terreno), estado, precio, moneda, area_m2, cuartos, banios, ubicacion(point), distrito, imagenes, agencia_id, publicada | **Se reemplaza** |
| `metricas_clicks` | propiedad_id, tipo_evento, sesion_id | Se adapta a lotes |
| `leads` | propiedad_id, nombre, email, telefono, consent_timestamp, cci | **Se reemplaza** por transacciones |

### 1.3 Estado del Stitch Design System

- **Completamente implementado**: MD3 tokens en `globals.css`, glassmorphism en `glass.css`, tipografía (Plus Jakarta Sans / Hanken Grotesk / JetBrains Mono)
- **Status colors**: `--status-success` (disponible), `--status-warning` (separado), `--status-destructive` (vendido) — **se reutilizan exactamente igual**
- **StatusChip**: Componente vivo y funcional — **se adapta sin cambios estructurales**
- **Icon system**: Lucide-react + Material Symbols (Icon component) — **ambos se mantienen**
- **WCAG tests**: `contrast.test.ts` — **no se modifica**

### 1.4 Mapeo archivos existentes → nuevo estado

| Archivo actual | Acción | Justificación |
|---------------|--------|---------------|
| **MapView.tsx** | REFACTOR → MapaLotes.tsx | Cambia propósito: de mapa de propiedades genéricas a mapa de lotización con polígonos. Leaflet con Polygon layers reemplaza a Markers. |
| **MarkerPopup.tsx** | REFACTOR → FichaTecnicaLote.tsx | Misma función pero para datos de lote (área, dimensiones, precio, estado). El popup ahora muestra ficha técnica completa. |
| **PropertyMarkers.tsx** | REFACTOR → PolygonLayer.tsx | De markers circulares a polígonos dibujados con coordenadas GeoJSON. Color-coded por estado. |
| **PropertyCard.tsx** | ADAPTAR → LoteCard.tsx | Misma card pero con datos específicos de lote. Sin cuartos/baños. Con área y dimensiones. |
| **PropertyFilters.tsx** | ELIMINAR | Demasiado complejo para el target. Reemplazar por tabs ultra-simples (Todos / Disponibles / Reservados / Vendidos). |
| **PropertyDetailPanel.tsx** | ELIMINAR → reemplazar por FichaTecnicaLote | El slide-over es complejo. Preferir modal o popup simple. |
| **PropertyList.tsx** | ADAPTAR → ListaLotes.tsx | Misma lista pero con LoteCard. Sidebar ultra-simple. |
| **AdminDashboard.tsx** | REFACTOR | Cambia de gestión de propiedades genéricas a gestión de proyectos de lotización + lotes + transacciones. |
| **AdminLogin.tsx** | MANTENER | Solo ajustar texto. La lógica de Supabase Auth es válida. |
| **HeaderNav.tsx** | REFACTOR → Navegación ultra-simple | Pasar de botón "Admin" a 3-4 tabs de navegación principal. |
| **HeroImage.tsx** | ADAPTAR → HeroProyecto.tsx | Hero ahora muestra imagen del proyecto (drone 360°), no de propiedad individual. |
| **LeadForm.tsx** | ELIMINAR | No aplica a lotización. Reemplazar por formulario de consulta simple integrado en FichaTecnicaLote. |
| **MetricasPanel.tsx** | ADAPTAR → MetricasLotes.tsx | Misma estructura pero queries adaptadas a lotes. |
| **SpecsGrid.tsx** | ELIMINAR | No aplica (cuartos/baños). Dimensiones de lote van en FichaTecnicaLote. |
| **Gallery.tsx** | ADAPTAR → Galeria360.tsx | Galería ahora muestra imágenes 360° del proyecto y vistas de drone. |
| **GlassControls.tsx** | MANTENER | Efecto visual válido para cualquier mapa. |
| **MasterPlanOverlay.tsx** | MANTENER | El overlay de plano maestro se reutiliza como capa opcional sobre el mapa de lotes. |
| **MapController.tsx** | MANTENER | FlyTo sigue siendo útil para navegar entre lotes. |
| **usePropiedades.ts** | RENOMBRAR → useLotes.ts | Mismo patrón, nuevo schema. |
| **useLeads.ts** | RENOMBRAR → useTransacciones.ts | Leads → transacciones (reservas/ventas). |
| **useMetricas.ts** | ADAPTAR → queries de lotes | Mismos hooks, queries cambian a tablas de lotes. |
| **useTopClicks.ts** | ADAPTAR → top lotes clickeados | Misma lógica, aplicada a lotes. |
| **useClickTracker.ts** | MANTENER | Lógica de tracking es independiente del tipo de entidad. |
| **icon-map.ts** | MANTENER | Muchos iconos (MapPin, Ruler, CheckCircle, etc.) siguen aplicando. Agregar iconos específicos de lotes si es necesario. |
| **formatters.ts** | MANTENER | formatPrice para PEN aplica igual. |
| **status-chip.tsx** | MANTENER | Estados exactamente iguales: disponible/separado/vendido. |
| **contrast.test.ts** | MANTENER | Los colores Stitch no cambian. |
| **globals.css** | MANTENER | Stitch tokens ya están correctos. |
| **glass.css** | MANTENER | Efectos glassmorphism. |
| **env.ts** | ADAPTAR | Eliminar VITE_AGENCIA_ID (ya no aplica multi-agencia). Agregar VITE_PROYECTO_ID. |
| **markers.ts** | RENOMBRAR → polygon-styles.ts | De colores de marcadores a colores de relleno de polígonos. |

---

## Fase 2: HIGH LEVEL Technical Contract

### A) Arquitectura de Datos (Supabase)

#### Nueva migración: `00005_lotizacion_schema.sql`

```sql
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
```

**Nota**: Las tablas antiguas (`propiedades`, `leads`, `agencias`, `perfiles`) y sus RLS se **conservan** pero se marcan como deprecated. Se eliminarán en una migración futura cuando toda la data esté migrada y verificada.

---

### B) Arquitectura de Componentes (Clean Architecture)

```
src/
├── domain/
│   ├── entities/
│   │   ├── proyecto.ts              # NUEVO
│   │   ├── lote.ts                  # NUEVO (reemplaza propiedad.ts)
│   │   ├── transaccion.ts           # NUEVO (reemplaza lead)
│   │   └── usuario-rol.ts           # NUEVO (reemplaza perfil)
│   ├── repositories/
│   │   ├── lotes.repository.ts      # Interfaz ILotesRepository
│   │   ├── proyectos.repository.ts  # Interfaz IProyectosRepository
│   │   └── transacciones.repository.ts  # Interfaz ITransaccionesRepository
│   └── usecases/                    # Lógica de negocio pura (opcional, puede ser directa)
├── data/
│   ├── repositories/
│   │   ├── supabase-lotes.repository.impl.ts
│   │   ├── supabase-proyectos.repository.impl.ts
│   │   └── supabase-transacciones.repository.impl.ts
│   └── datasources/                 # Se deja para futura expansión
├── presentation/
│   ├── components/
│   │   ├── ui/                      # MANTENER (status-chip, icon, etc.)
│   │   ├── lotes/                   # NUEVOS — componentes core del sistema
│   │   │   ├── MapaLotes.tsx        # Leaflet con Polygon layer
│   │   │   ├── PolygonLayer.tsx     # Renderiza polígonos de lotes color-coded
│   │   │   ├── FichaTecnicaLote.tsx  # Popup/modal con datos completos del lote
│   │   │   ├── ListaLotes.tsx       # Sidebar ultra-simple con LoteCards
│   │   │   ├── LoteCard.tsx         # Card minimalista para listado
│   │   │   ├── FiltrosLotes.tsx     # Tabs ultra-simples: Todos / Disponibles / Reservados / Vendidos
│   │   │   └── ConsultaLote.tsx     # Formulario simple de consulta (reemplaza LeadForm)
│   │   ├── admin/                   # REFACTOR
│   │   │   ├── AdminDashboard.tsx   # Refactor: lotes + proyectos + transacciones
│   │   │   ├── AdminLogin.tsx       # MANTENER (cosmético)
│   │   │   ├── GestionLotes.tsx     # NUEVO — CRUD lotes
│   │   │   ├── GestionProyectos.tsx # NUEVO — CRUD proyectos
│   │   │   ├── ReportesLotes.tsx    # NUEVO — CSV/Excel export
│   │   │   └── MetricasLotes.tsx    # Refactor de MetricasPanel
│   │   ├── map/                     # COMPONENTES MAPA
│   │   │   ├── MapaBase.tsx         # NUEVO — MapContainer reutilizable
│   │   │   ├── Tour360.tsx          # NUEVO — Pannellum panorama viewer
│   │   │   └── UbicacionMapa.tsx    # NUEVO — Mapa de ubicación del proyecto
│   │   ├── shared/                  # COMPONENTES COMPARTIDOS
│   │   │   ├── HeroProyecto.tsx     # Refactor de HeroImage
│   │   │   ├── HeaderNav.tsx        # Refactor: navegación ultra-simple
│   │   │   └── GaleriaProyecto.tsx  # Refactor de Gallery
│   │   └── glass/                   # MANTENER
│   │       └── GlassControls.tsx
│   ├── hooks/
│   │   ├── useLotes.ts              # NUEVO (reemplaza usePropiedades)
│   │   ├── useProyectos.ts          # NUEVO
│   │   ├── useTransacciones.ts      # NUEVO (reemplaza useLeads)
│   │   ├── useMetricas.ts          # ADAPTAR (queries a lotes)
│   │   ├── useTopClicks.ts         # ADAPTAR (aplica a lotes)
│   │   └── useClickTracker.ts      # MANTENER
│   └── navigation/                  # NUEVO
│       └── AppRouter.tsx            # Router ultra-simple con tabs
├── lib/
│   ├── utils.ts                     # MANTENER
│   ├── icon-map.ts                  # MANTENER + extender
│   └── supabase/                    # MANTENER
├── config/
│   ├── env.ts                       # ADAPTAR (quitar VITE_AGENCIA_ID)
│   ├── glass.css                    # MANTENER
│   └── polygon-styles.ts            # NUEVO (reemplaza markers.ts)
├── App.tsx                          # REFACTOR: router simplificado
└── globals.css                      # MANTENER
```

---

### C) Decisiones Técnicas (Cerradas)

#### C.1 Mapa 360° de lotes

| Decisión | Opciones | Elegida | Razón |
|----------|----------|---------|-------|
| Render de lotes | Leaflet Polygon vs ThreeJS/WebGL | **Leaflet Polygon** | Leaflet ya está instalado, Polygon layers son nativos. ThreeJS es overkill para 2D. El target no necesita WebGL. |
| Tour 360° | Pannellum vs ThreeJS vs Kuula embebido | **Pannellum** | Librería ultra-liviana (sin dependencias), open source, fácil de incrustar. Las imágenes las provee el cliente (drone). |
| Formato coordenadas | GeoJSON vs WKT vs array simple | **GeoJSON Polygon** | Estándar web, nativo en Leaflet (L.geoJSON), fácil de almacenar en JSONB de Supabase. |
| Almacenamiento imágenes 360 | Supabase Storage vs URLs externas | **Supabase Storage (URLs públicas)** | Ya usamos Supabase. El cliente sube las imágenes renderizadas del drone. |

#### C.2 Autenticación y Roles

| Decisión | Opciones | Elegida | Razón |
|----------|----------|---------|-------|
| Gestión de roles | app_metadata vs tabla separada | **Tabla `usuarios_rol`** | app_metadata no es consultable vía RLS fácilmente. Con tabla separada podemos hacer RLS policies eficientes y reportes. |
| Registro de vendedores | Auto-registro vs solo admin crea | **Solo admin crea** | Target son personas mayores. Seguridad primero. El admin registra vendedores manualmente. |
| RLS por rol | Policy por rol vs helper function | **Policy directa** | Más simple de mantener. El schema tiene pocas tablas. |

#### C.3 Navegación Ultra-Simple

| Decisión | Elegida | Razón |
|----------|---------|-------|
| Número de items nav | **4 como máximo** | Target: personas mayores. Más de 4 items = confusión. |
| Layout | **Tabs horizontales grandes con iconos** | Botones grandes y claros. Sin hamburguer menus. |
| Contraste | **Textos grandes (≥16px), iconos grandes** | WCAG AA para adultos mayores. |
| Mobile first | **Sí** | Muchos usuarios acceden desde tablet/celular. |

#### C.4 Export CSV

| Decisión | Elegida | Razón |
|----------|---------|-------|
| Librería | **papaparse** | Liviana, sin dependencias, soporta grandes volúmenes, streaming. |
| Disparo | **Botón en AdminDashboard → exporta data filtrada** | UX simple: un click y descarga. |
| Formato | **UTF-8 BOM + separador ;** | Compatible con Excel en español (reconoce UTF-8 por BOM y separador ; correctamente). |

#### C.5 Polígonos de Lotes

| Decisión | Elegida | Razón |
|----------|---------|-------|
| Formato | **GeoJSON Polygon en JSONB** | Nativo en Leaflet `L.geoJSON()`, consultable desde Supabase, sin dependencias extra. |
| Tooltip | **Hover muestra código + área** | Feedback inmediato sin click. |
| Click | **Abre FichaTecnicaLote** | Popup y/o modal según dispositivo. |
| Color por estado | **disponible=success, reservado=warning, vendido=destructive** | Reutiliza las variables CSS existentes de Stitch. Consistencia visual. |

#### C.6 Tour 360° con Pannellum

| Decisión | Elegida | Razón |
|----------|---------|-------|
| Integración | **Componente React que monta Pannellum en un div** | Pannellum no tiene bindings React oficiales, pero montarlo es trivial. |
| Fallback | **Imagen estática si no hay 360** | Para proyectos sin imágenes de drone. |
| Carga | **Lazy load** | No bloquear el mapa principal. |

---

### D) Entidades del Nuevo Dominio

#### domain/entities/lote.ts
```typescript
export type EstadoLote = "disponible" | "reservado" | "vendido";
export type TipoTransaccion = "reserva" | "venta";

export interface Lote {
  id: string;
  proyectoId: string;
  codigo: string;           // "Lote 127", "MZ-A LT-3"
  areaTotal: number;        // m²
  frente?: number;          // metros lineales
  fondo?: number;           // metros lineales
  precio: number;
  moneda: "PEN" | "USD";
  estado: EstadoLote;
  poligonoCoords: number[][][];  // GeoJSON Polygon coordinates
  imagenPlano?: string;     // URL del plano
  descripcion?: string;
  orden: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  coordenadasCentro: { lat: number; lng: number };
  imagenHero?: string;
  imagenes360: string[];    // URLs para Pannellum
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaccion {
  id: string;
  loteId: string;
  tipo: TipoTransaccion;
  compradorNombre: string;
  compradorDocumento?: string;
  compradorEmail?: string;
  compradorTelefono?: string;
  monto: number;
  moneda: "PEN" | "USD";
  idVendedor?: string;
  notas?: string;
  createdAt: string;
}

export interface UsuarioRol {
  id: string;
  authUserId: string;
  email: string;
  nombre: string;
  rol: "admin" | "vendedor" | "comprador";
  telefono?: string;
  activo: boolean;
}

export interface DashboardMetricas {
  totalLotes: number;
  disponibles: number;
  reservados: number;
  vendidos: number;
  totalTransacciones: number;
  avancePorcentaje: number;
  totalVentasPen: number;
  totalVentasUsd: number;
}
```

#### domain/repositories/lotes.repository.ts
```typescript
export interface ILotesRepository {
  listar(proyectoId: string, filtros?: FiltrosLotes): Promise<Lote[]>;
  obtenerPorId(id: string): Promise<Lote | null>;
  crear(lote: CrearLoteData): Promise<Lote>;
  actualizar(id: string, data: Partial<Lote>): Promise<Lote>;
  cambiarEstado(id: string, estado: EstadoLote): Promise<Lote>;
  eliminar(id: string): Promise<void>;
}

export interface FiltrosLotes {
  estado?: EstadoLote;
  search?: string;
}
```

---

### E) SDD Tasks (Plan de Ejecución)

Cada HU debe pasar los gates: QA (tests + linting + typecheck) → Security → Design → Emulator Test.

| # | HU | Descripción | Depende de | Archivos afectados | Gate clave |
|---|----|-------------|-----------|-------------------|------------|
| **HU-001** | Schema Supabase | Crear migración `00005_lotizacion_schema.sql` con tablas proyectos, lotes, usuarios_rol, transacciones + RLS + migración de datos existentes | Ninguna | `supabase/migrations/00005_lotizacion_schema.sql` | QA |
| **HU-002** | Entities + Repos | Crear tipos, interfaces, repositorios para Lote, Proyecto, Transaccion | HU-001 | `src/domain/entities/{lote,proyecto,transaccion,usuario-rol}.ts`, `src/domain/repositories/lotes.repository.ts`, `src/data/repositories/*.ts` | QA |
| **HU-003** | Hooks useLotes | Crear hooks useLotes, useProyectos, useTransacciones con TanStack Query | HU-002 | `src/presentation/hooks/{useLotes,useProyectos,useTransacciones}.ts` | QA |
| **HU-004** | Mapa de lotes con polígonos | Refactor MapView → MapaLotes con Leaflet Polygon. PolygonLayer renderiza lotes desde GeoJSON. Color por estado. | HU-003 | `src/presentation/components/lotes/{MapaLotes,PolygonLayer}.tsx` | QA + Security |
| **HU-005** | Ficha técnica del lote | Refactor MarkerPopup → FichaTecnicaLote. Muestra: código, área, frente, fondo, precio, estado, imagen plano, botón consulta. | HU-004 | `src/presentation/components/lotes/FichaTecnicaLote.tsx` | QA + Design |
| **HU-006** | Navegación ultra-simple | Refactor HeaderNav. 4 tabs grandes: Inicio, Ubicación, Lotización, Financiamiento. Sin hamburguer. Textos grandes. | HU-003 | `src/presentation/components/shared/HeaderNav.tsx`, `src/App.tsx` | Design |
| **HU-007** | Roles y autenticación | Integrar Supabase Auth con tabla usuarios_rol. AdminLogin mantiene. Vendedor login con restricción. RLS ya en migración. | HU-001 | `src/presentation/components/admin/AdminLogin.tsx`, `src/lib/supabase/client.ts` | Security |
| **HU-008** | Rol vendedor + estado en tiempo real | Vendedor: después de login, ve mapa de lotes + botón para cambiar estado. Actualización en tiempo real (Supabase Realtime o polling). | HU-007, HU-004 | `src/presentation/components/vendedor/*.tsx` | QA + Security |
| **HU-009** | AdminDashboard para lotes | Refactor AdminDashboard: tabs → Dashboard, Lotes, Proyectos, Reportes. Export CSV con papaparse. | HU-001, HU-002 | `src/presentation/components/admin/{AdminDashboard,GestionLotes,GestionProyectos,ReportesLotes,MetricasLotes}.tsx` | QA + Security |
| **HU-010** | Landing + Hero + Ubicación | HeroProyecto muestra imagen del proyecto (drone). Sección Ubicación con OpenStreetMap centrado en coordenadas del proyecto. | HU-003 | `src/presentation/components/shared/HeroProyecto.tsx`, `src/presentation/components/map/UbicacionMapa.tsx` | Design |
| **HU-011** | Tour 360° con Pannellum | Componente Tour360 que carga Pannellum con imágenes del proyecto. Lazy load. Fallback a imagen estática. | HU-001 | `src/presentation/components/map/Tour360.tsx` | QA + Design |
| **HU-012** | Filtros ultra-simples | FiltrosLotes con tabs: Todos / Disponibles / Reservados / Vendidos. Sin selects, sin inputs numéricos. | HU-003 | `src/presentation/components/lotes/FiltrosLotes.tsx` | Design |
| **HU-013** | Consulta de lote (comprador) | Formulario simple desde FichaTecnica: nombre + teléfono + email. Sin captcha (target mayores). Guarda en transacciones como "reserva". | HU-002, HU-005 | `src/presentation/components/lotes/ConsultaLote.tsx` | QA + Security |
| **HU-014** | Migración de datos legacy | Script SQL para migrar propiedades (tipo=lote/terreno) → lotes, leads → transacciones. Verificar integridad. | HU-001 | `supabase/migrations/00006_migracion_legacy.sql` | QA |
| **HU-015** | Cleanup archivos legacy | Eliminar componentes obsoletos: PropertyFilters, PropertyDetailPanel, SpecsGrid, LeadForm, PropertyCard, PropertyMarkers, PropertyList. | HU-004, HU-005, HU-012, HU-013 | Múltiples archivos en `src/presentation/components/map/` | QA |
| **HU-016** | Config y env cleanup | Eliminar VITE_AGENCIA_ID. Agregar VITE_PROYECTO_ID. Actualizar env.ts. | HU-001 | `src/config/env.ts`, `.env.example` | QA |
| **HU-017** | Financiamiento (opcional) | Sección de financiamiento: cuotas, opciones de pago. Según requiera la inmobiliaria. Puede ser HU futura. | HU-006 | Depende de diseño final | Design |
| **HU-018** | Responsive + accesibilidad | Ajustes finales: mobile, tablet, desktop. Textos grandes. Touch targets ≥ 48px. | TODAS | Varios componentes | QA + Design |

#### Orden de ejecución recomendado

```
Fase 1 (Fundación):
  HU-001 → HU-002 → HU-003 → HU-014 → HU-016

Fase 2 (Core público):
  HU-004 → HU-005 → HU-006 → HU-010 → HU-012 → HU-011 → HU-013 → HU-015

Fase 3 (Staff):
  HU-007 → HU-008 → HU-009

Fase 4 (Polish):
  HU-017 (opcional) → HU-018
```

---

### F) Justificaciones Técnicas

#### ¿Por qué Leaflet y no ThreeJS/WebGL?
- Leaflet ya es dependencia instalada
- Polygon layers son nativos de Leaflet y soportan GeoJSON directamente
- ThreeJS requeriría cargar una escena 3D completa para algo que es esencialmente 2D
- El target (personas mayores) no necesita efectos 3D espectaculares
- Consumo de recursos: Leaflet es significativamente más liviano

#### ¿Por qué Pannellum y no Kuula/Matterport?
- Pannellum es open source, sin costo
- No requiere cuenta de terceros
- Las imágenes se alojan en Supabase Storage (control total del cliente)
- Kuula/Matterport son servicios SAAS con costos recurrentes
- Pannellum se integra como un componente React simple

#### ¿Por qué tabla usuarios_rol y no app_metadata?
- RLS no puede consultar app_metadata de forma declarativa
- Con tabla separada podemos hacer políticas como `auth.uid() IN (SELECT auth_user_id FROM usuarios_rol WHERE rol = 'admin')`
- Reportes y consultas SQL directas son posibles
- Separación clara entre auth (Supabase) y autorización (nuestra tabla)

#### ¿Por qué eliminar filtros complejos?
- Target: personas mayores que no dominan tecnología
- Más de 2-3 opciones de filtro = abandono
- Tabs visuales con iconos grandes son más intuitivos que selects y rangos numéricos
- Los filtros actuales (PropertyFilters.tsx) asumen conocimiento técnico (tipo de propiedad, distritos de Lima)

#### ¿Por qué eliminar el modelo multi-agencia?
- El cliente es una inmobiliaria de Ayacucho
- No hay requerimiento de multi-tenant
- Simplifica enormemente RLS policies, queries y UX
- Si en futuro necesitan multi-agencia, se puede extender agregando `inmobiliaria_id` a proyectos

#### ¿Por qué StatusChip se mantiene sin cambios?
- Los estados disponibles/separado/vendido se alinean exactamente con disponible/reservado/vendido
- Los colores CSS (`--status-success/warning/destructive`) son idénticos
- El componente es genérico y no depende del dominio
- Tests de contraste WCAG no se ven afectados

---

### G) Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cliente no provee imágenes 360° de drone | Tour 360° no funcional | Fallback a imagen estática + galería tradicional |
| Coordenadas de polígono incorrectas | Lotes mal posicionados | Validación en frontend (Leaflet bounds check). Herramienta de ajuste manual para admin. |
| Migración de datos legacy corrupta | Pérdida de lotes existentes | Migración con transacción SQL, verificación post-migración, rollback preparado. |
| Usuarios mayores confundidos con UI | Abandono del sistema | Test de usabilidad con 3-5 usuarios del target ANTES de producción. Iterar. |
| Pannellum no funciona en iOS Safari | Tour 360° roto en iPhone | Verificar compatibilidad cross-browser. Fallback a imagen estática + galería. Pannellum es compatible con Safari 12+. |

---

### H) Cronograma Estimado

| Fase | HUs | Esfuerzo estimado | Dependencias |
|------|-----|-------------------|-------------|
| Fase 1 (Fundación) | 001-003, 014, 016 | 3-4 días | - |
| Fase 2 (Core público) | 004-006, 010-013, 015 | 4-6 días | Fase 1 |
| Fase 3 (Staff) | 007-009 | 3-4 días | Fase 1 |
| Fase 4 (Polish) | 017-018 | 2-3 días | Fase 2 + 3 |
| Testing + QA | TODAS | 2-3 días | TODAS |
| **Total** | **18 HU** | **14-20 días hábiles** | — |

---

### I) Preguntas para el Cliente (Close Decisions)

Antes de implementar, deben cerrarse:

1. **Imágenes 360°**: ¿El cliente tiene acceso a drone o proveedor que genere renders 360° del proyecto? ¿O usamos solo fotos estáticas?
2. **Coordenadas de lotes**: ¿Quién provee las coordenadas de polígono de cada lote? ¿Topógrafo? ¿El cliente tiene planos digitalizados?
3. **Financiamiento**: ¿Es requisito para el MVP o se puede postergar a HU-017?
4. **Moneda**: ¿Solo PEN o también USD? (asumimos PEN por Ayacucho)
5. **Documento de comprador**: ¿DNI o también CE (Carné de Extranjería)?
6. **Número de vendedores**: ¿Cuántos vendedores tendrán acceso inicial?
7. **Nombre del proyecto**: ¿Cómo se llama el proyecto de lotización? (Para hero, título, etc.)
8. **Idioma**: ¿Solo español o quechua también? (Ayacucho es zona quechua-hablante. Podría ser un diferenciador importante.)

---

*Documento generado por statick. Próximo paso: validación con el equipo (gentle-orchestrator + sdd-apply + qa-engineer)*
