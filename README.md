# Showroom Digital Inmobiliario

Showroom inmobiliario interactivo con mapa de propiedades en tiempo real, analytics de clics, dashboard administrativo, **panel vendedor con comisiones**, **lead scoring IA**, **PWA offline**, **WhatsApp integration** y cumplimiento LPDP.

## Stack

- **React 19** + **Vite 8** (static site, hash-based routing)
- **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI primitives)
- **React Query** + **Zustand** (state management)
- **Leaflet** (mapas interactivos con marcadores circulares 16px)
- **Supabase** (PostgreSQL, autenticación, Realtime)
- **Vitest** (unit testing, **795+ tests**)
- **Playwright** (E2E testing)
- **vite-plugin-pwa** (Progressive Web App)
- **Workbox** (service worker + caching estratégico)

## Funcionalidades

### 🗺️ Showroom Interactivo
- Mapa con marcadores de propiedades (círculos 16px, color por estado)
- Panel lateral con filtros por estado, precio, moneda y tipo
- Vista detalle en modal (desktop: Radix Dialog, mobile: slide framer-motion)
- Galería de imágenes y especificaciones técnicas
- Formulario de contacto con **Cloudflare Turnstile** + consentimiento LPDP
- Control de zoom + geolocalización + capas

### 🧭 Navegación Unificada
- **Navbar responsive** con hamburger menu en móvil
- Rutas hash-based: `#showroom`, `#app`, `#admin`, `#vendedor`, `#privacidad`
- HeaderNav secundario en `#app` (Inicio / Ubicación / Lotización / Financiamiento)

### 💬 WhatsApp Integration
- Botón WhatsApp en tarjetas de propiedad y vista detalle
- Links `wa.me` con mensaje pre-rellenado (título + precio)
- Tracking de clics en `lead_events` para lead scoring
- Funciona en móvil (app) y desktop (WhatsApp Web)

### 📱 PWA Offline
- **vite-plugin-pwa** + Workbox
- Service worker con cache `NetworkFirst` para API Supabase
- `CacheFirst` para assets estáticos
- Indicador "Modo offline" al perder conexión
- Manifest configurado para install prompt

### 🎯 AI Lead Scoring
- Algoritmo ponderado: vistas×10 + clicks×25 + tiempo/3 + repeticiones×15
- Score 0–100 (baseline 10) con badges: Alto/Medio/Bajo
- RPC Supabase `compute_lead_score(visitor_id)` para cálculo server-side
- Panel `LeadScoringPanel` con leads ordenados por score

### 👨‍💼 Vendedor Dashboard
- **Team leads visibility**: ve leads de todo el equipo
- **Comisiones variables** por rangos de precio (configurable)
- **SUNAT RUC validation** con cache 24h (localStorage)
- Tabla de comisiones: Pendiente / Aprobado / Pagado
- Resumen stats: leads activos, score promedio, comisiones pendientes

### 📊 Dashboard Administrativo
- Tabla de propiedades con búsqueda y filtros
- Gráfico donut de estado y barra de progreso
- Tabla de propiedades más clickeadas
- Gestión de leads con estado y seguimiento
- Modificación inline de estado (CCI, método de pago) con confirmación
- **Actualización en tiempo real** vía Supabase Realtime
- **Analytics Dashboard** — gráficos de barras, pie charts, métricas de tour
- **Tour Management** — CRUD de POIs (amenidades, puntos de interés)

### 🔒 Cumplimiento Legal
- **LPDP (Ley 29733)**: Banner de cookies con consentimiento explícito
- Privacidad trackeada: `consent_timestamp`, `consent_ip`, `user_agent`
- Formulario con consentimiento para tratamiento de datos
- Página de política de privacidad (`#privacidad`)
- Turnstile anti-bot en formulario de contacto

### 📈 Analytics
- Tracking de clics en propiedades (marcadores, cards, vista detalle)
- Top propiedades más clickeadas en dashboard
- Eventos tipados: `click_propiedad`, `vista_detalle`
- Sesiones vía `crypto.randomUUID()` + localStorage
- **Actualización en tiempo real** sin recargar página

### 🧭 Virtual Tour 360°
- Tour interactivo con panorama esférico (R3F + drei)
- **Parcel Overlay** — lotes proyectados en 3D con estados en tiempo real
- **POI Markers** — amenidades y puntos de interés con iconos emoji
- **WhatsApp Deep Links** — contacto directo desde el tour
- **Keyboard Navigation** — flechas, WASD, scroll para rotación
- **Auto-rotation** — rotación automática con pausa en interacción

### 🎯 Tour Analytics (P1)
- **Batched Analytics** — buffer de 50 eventos, flush cada 5s
- **Visitor Tracking** — ID persistente vía localStorage
- **Event Types** — `parcel_click`, `whatsapp_click`, `share_click`, `tour_start`
- **RPC Aggregation** — `get_analytics_summary` para métricas agregadas
- **Date Range Filtering** — filtrar por rango de fechas

### 🏢 POI System (P1)
- **POI Types** — amenity, road, attraction, landmark, other
- **Emoji Icons** — 🏢 amenidad, 🛣️ vía, 🎯 atracción, 🏛️ monumento, 📍 otro
- **CRUD Operations** — crear, editar, eliminar POIs
- **Badge Colors** — colores por tipo de POI
- **Detail Panel** — información del POI en bottom-sheet

## Development

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo (Vite 8)
pnpm dev

# Build de producción
pnpm build

# Preview del build
pnpm preview

# Tests unitarios (Vitest)
pnpm test

# Verificar (typecheck + lint + test + build)
pnpm verify

# E2E (Playwright)
npx playwright test
```

## Deploy

El proyecto se despliega automáticamente en **GitHub Actions** → **GitHub Pages** cuando se hace push a `main`.

```
https://statick88.github.io/showroom-digital-inmobiliario/
```

### Secrets requeridos (GitHub Actions)

| Secret | Descripción |
|--------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable de Supabase |
| `VITE_AGENCIA_ID` | ID de la agencia inmobiliaria |
| `VITE_TURNSTILE_SITE_KEY` | Site key de Cloudflare Turnstile |

> ⚠️ Las variables usan prefijo `VITE_` (Vite), no `NEXT_PUBLIC_`.

### Supabase Realtime

Las suscripciones en tiempo real requieren habilitar Realtime en el dashboard de Supabase para las tablas `propiedades` y `lotes`:

```sql
-- Habilitar Realtime (desde dashboard o SQL)
alter publication supabase_realtime add table propiedades;
alter publication supabase_realtime add table lotes;
```

## Arquitectura

```
src/
├── domain/                    # Entidades, repositorios (interfaces)
│   ├── entities/             # Propiedad, Lote, MetricaClick, Lead, LeadEvent, LeadScore, Commission, CommissionRule, TourPOI, AnalyticsEvent
│   └── repositories/         # Interfaces: leadEvents, leadScores, commissions, analytics, tourPOIs
├── data/                     # Implementaciones
│   └── repositories/         # Supabase repos + lead events + lead scores + commissions + analytics + tour POIs
├── presentation/             # UI
│   ├── components/
│   │   ├── map/              # Mapa, marcadores, filtros, LeadForm
│   │   ├── admin/            # Dashboard, gráficos, tablas, TourAnalyticsDashboard, TourManagementTab
│   │   ├── detail/           # Panel de detalle de propiedad
│   │   ├── virtual-tour/     # ParcelOverlay, POIMarker, POIOverlay, POIDetailPanel
│   │   ├── vendedor/         # VendedorDashboard, CommissionTable, TeamLeadsView
│   │   ├── whatsapp/         # WhatsAppButton
│   │   ├── pwa/              # OfflineIndicator
│   │   ├── leads/            # LeadScoreCard, LeadScoringPanel
│   │   └── shared/           # Navbar, HeaderNav, CookieBanner
│   ├── hooks/                # Custom hooks
│   │   ├── useWhatsApp.ts           # wa.me URL + tracking
│   │   ├── useOnlineStatus.ts       # online/offline detection
│   │   ├── useLeadScoring.ts        # lead score queries
│   │   ├── useCommissions.ts        # commissions + rules
│   │   ├── useRealtimeSubscription.ts   # Genérico Supabase Realtime
│   │   ├── useRealtimePropiedades.ts    # Realtime propiedades
│   │   ├── useRealtimeLotes.ts          # Realtime lotes
│   │   ├── useClickTracker.ts           # Tracking de clics
│   │   ├── useTopClicks.ts              # Top propiedades clickeadas
│   │   ├── useStatusMutation.ts         # Mutación de estado con confirmación
│   │   ├── useTourAnalytics.ts          # Analytics batched del tour
│   │   ├── useAnalyticsAggregates.ts    # Métricas agregadas (RPC)
│   │   ├── usePOIs.ts                   # CRUD de puntos de interés
│   │   └── useParcelsForTour.ts         # Lotes proyectados en tour 360°
│   └── store/                # Zustand stores (MapInstanceStore, AuthStore)
├── lib/                      # Utilidades
│   ├── supabase/             # Cliente Supabase
│   ├── sunat/                # RUC validator + cache
│   └── auth.ts               # Auth service (signIn, signOut, session)
└── config/                   # Configuración
    ├── env.ts                # Variables de entorno tipadas
    ├── markers.ts            # Config de marcadores (16px, colores)
    ├── parcel-colors.ts      # Colores por estado de lote
    ├── poi-icons.ts          # Iconos emoji por tipo de POI
    └── glass.css             # Estilos glassmorphism
```

### Supabase Realtime

Las suscripciones en tiempo real requieren habilitar Realtime en el dashboard de Supabase para las tablas `propiedades` y `lotes`:

```sql
-- Habilitar Realtime (desde dashboard o SQL)
alter publication supabase_realtime add table propiedades;
alter publication supabase_realtime add table lotes;
```

## Migraciones de Base de Datos (Nuevas)

| Migración | Tabla(s) | Propósito |
|-----------|----------|-----------|
| `00021_lead_events.sql` | `lead_events` | Tracking de engagement (views, whatsapp_clicks, time_spent, repeat_visit) |
| `00022_lead_scores.sql` | `lead_scores` + RPC `compute_lead_score` | Scores computados + función server-side |
| `00023_commissions.sql` | `commission_rules`, `vendedor_commissions`, `invoices` | Reglas de comisión, tracking + facturación |
| `00028_add_panorama_center.sql` | `tours` | Coordenadas centro del panorama (lat/lng) |
| `00029_backfill_panorama_centers.sql` | `tours` | Backfill de coordenadas para tours existentes |
| `00030_analytics_events.sql` | `analytics_events` | Eventos de analytics del tour (batched) |
| `00031_tour_pois.sql` | `tour_pois` | Puntos de interés del tour (amenidades, etc.) |

## Diseño

- **Plus Jakarta Sans** (headings + UI) + **Hanken Grotesk** (body)
- **Glassmorphism**: paneles translúcidos con backdrop-filter
- **Stitch Andean Modernity**: paleta tierra + metálica, tipografía limpia
- Dark mode nativo
- shadcn/ui con tema personalizado

## Tests

```bash
# Unit tests (Vitest) — 795+ tests
pnpm test

# Con coverage
pnpm test -- --coverage
```

### Test structure
```
src/presentation/components/__tests__/    # Phase 3: AdminDashboard, login
src/presentation/components/map/__tests__/  # Phase 5: Map, LeadForm
src/presentation/components/vendedor/__tests__/  # VendedorDashboard, CommissionTable, TeamLeadsView
src/presentation/components/whatsapp/__tests__/  # WhatsAppButton
src/presentation/components/pwa/__tests__/  # OfflineIndicator, useOnlineStatus
src/presentation/components/leads/__tests__/  # LeadScoreCard, LeadScoringPanel
src/presentation/hooks/__tests__/         # useWhatsApp, useLeadScoring, useCommissions, useOnlineStatus, useTourAnalytics, usePOIs, useAnalyticsAggregates
src/data/repositories/__tests__/          # lead-events, lead-scores, commissions
src/domain/entities/__tests__/            # lead, lead-score, commission
src/domain/repositories/__tests__/        # lead-events, lead-scores, commissions
src/lib/schemas/__tests__/                # migrations 00021, 00022, 00023
src/lib/sunat/__tests__/                  # ruc-validator
src/testing/e2e/                          # E2E con Playwright (14 tests)
```

## Licencia

MIT