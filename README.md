# Showroom Digital Inmobiliario

Showroom inmobiliario interactivo con mapa de propiedades en tiempo real, analytics de clics, dashboard administrativo y cumplimiento LPDP.

## Stack

- **React 19** + **Vite 8** (static site, hash-based routing)
- **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI primitives)
- **React Query** + **Zustand** (state management)
- **Leaflet** (mapas interactivos con marcadores circulares 16px)
- **Supabase** (PostgreSQL, autenticación, Realtime)
- **Vitest** (unit testing, 152+ tests)
- **Playwright** (E2E testing)

## Funcionalidades

### 🗺️ Showroom Interactivo
- Mapa con marcadores de propiedades (círculos 16px, color por estado)
- Panel lateral con filtros por estado, precio, moneda y tipo
- Vista detalle en modal (desktop: Radix Dialog, mobile: slide framer-motion)
- Galería de imágenes y especificaciones técnicas
- Formulario de contacto con **Cloudflare Turnstile** + consentimiento LPDP
- Control de zoom + geolocalización + capas

### 📊 Dashboard Administrativo
- Tabla de propiedades con búsqueda y filtros
- Gráfico donut de estado y barra de progreso
- Tabla de propiedades más clickeadas
- Gestión de leads con estado y seguimiento
- Modificación inline de estado (CCI, método de pago) con confirmación
- **Actualización en tiempo real** vía Supabase Realtime

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
│   ├── entities/             # Propiedad, Lote, MetricaClick, Lead
│   └── repositories/         # Interfaces de repositorios
├── data/                     # Implementaciones
│   └── repositories/         # Supabase repos + repositorio de métricas
├── presentation/             # UI
│   ├── components/
│   │   ├── map/              # Mapa, marcadores, filtros, LeadForm
│   │   ├── admin/            # Dashboard, gráficos, tablas
│   │   ├── detail/           # Panel de detalle de propiedad
│   │   └── shared/           # CookieBanner, componentes comunes
│   ├── hooks/                # Custom hooks
│   │   ├── useRealtimeSubscription.ts   # Genérico Supabase Realtime
│   │   ├── useRealtimePropiedades.ts    # Realtime propiedades
│   │   ├── useRealtimeLotes.ts          # Realtime lotes
│   │   ├── useClickTracker.ts           # Tracking de clics
│   │   ├── useTopClicks.ts              # Top propiedades clickeadas
│   │   └── useStatusMutation.ts         # Mutación de estado con confirmación
│   └── store/                # Zustand stores (MapInstanceStore)
├── lib/                      # Utilidades
│   ├── supabase/             # Cliente Supabase
│   └── auth.ts               # Auth service (signIn, signOut, session)
└── config/                   # Configuración
    ├── env.ts                # Variables de entorno tipadas
    ├── markers.ts            # Config de marcadores (16px, colores)
    └── glass.css             # Estilos glassmorphism
```

## Diseño

- **Plus Jakarta Sans** (headings + UI) + **Hanken Grotesk** (body)
- **Glassmorphism**: paneles translúcidos con backdrop-filter
- **Stitch Andean Modernity**: paleta tierra + metálica, tipografía limpia
- Dark mode nativo
- shadcn/ui con tema personalizado

## Tests

```bash
# Unit tests (Vitest) — 152+ tests
pnpm test

# Con coverage
pnpm test -- --coverage
```

### Test structure
```
src/presentation/components/__tests__/    # Phase 3: AdminDashboard, login
src/presentation/components/map/__tests__/  # Phase 5: Map, LeadForm
src/lib/__tests__/                       # Phase 5: auth, icon-map
src/testing/e2e/                         # E2E con Playwright
```

## Licencia

MIT