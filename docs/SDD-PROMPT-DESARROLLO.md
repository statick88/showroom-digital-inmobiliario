# PROMPT: DESARROLLO SDD - SHOWROOM DIGITAL INMOBILIARIO MVP

## Contexto
Arquitecto 3D busca socio tecnológico para MVP de showroom digital. Tú eres el desarrollador (Diego Saavedra). El arquitecto provee renders premium e imágenes; tú construyes el código y arquitectura.

## Objetivo del MVP
Plataforma web interactiva que provea a inmobiliarias información cuantificable al instante.

## Requerimientos Funcionales (3 Pilares)

1. **Gestión de Stock en Tiempo Real**
   - Panel visual con estado: Disponible / Separado / Vendido
   - Mapa interactivo con marcadores coloreados por estado
   - Filtros por estado/tipo/precio

2. **Dashboard Analítico Automatizado**
   - Gráfico de avance de ventas (% vendido vs disponible)
   - Totales por estado (disponibles, separadas, vendidas)
   - Total clics y leads generados

3. **Métricas de Interés (Click-Tracking)**
   - Registro de clics por propiedad
   - Top 10 propiedades más clickeadas
   - Vista en dashboard con ranking

## Stack Definido (No Negociable)
- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** + **React Query v5**
- **Leaflet** + **React Leaflet** (mapas 2D)
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- **Deploy:** GitHub Pages (estático)

## Arquitectura Hexagonal
```
src/
├── domain/entities/      # propiedad.ts, lead.ts, metrica.ts
├── data/repositories/    # Supabase implementations
├── presentation/components/
│   ├── map/             # MapView, PropertyMarkers, MetricasPanel
│   └── admin/           # AdminDashboard
└── lib/supabase/        # Cliente configurado
```

## Modelo de Datos (Supabase)

### Tablas
- `propiedades`: id, codigo, tipo (lote|departamento), estado (disponible|separado|vendido), precio, ubicacion (point), svg_id, imagenes (jsonb)
- `metricas_clicks`: propiedad_id, tipo_evento, sesion_id, created_at
- `leads`: propiedad_id, nombre, email, telefono, score, estado

### Vistas/Functions
- `obtener_metricas_dashboard(p_agencia_id)`: Retorna conteos y % avance
- `obtener_top_clicks(p_agencia_id, p_limite)`: Top propiedades por interés

## Implementación por Fases (1-2 semanas cada una)

### Fase 1: Foundation
1. Setup Vite + React 19 + Tailwind + shadcn
2. Supabase client con anon key + RLS
3. MapView base con Leaflet
4. PropertyCard component con estados
5. useClickTracker hook con debounce

### Fase 2: Stock & Dashboard
1. MetricasPanel con 6 cards de estado
2. Filtros por estado/tipo/precio
3. Lead form con validación Zod
4. Top propiedades por clicks en dashboard

### Fase 3: Optimización
1. SVGs interactivos para lotes (del arquitecto)
2. Optimización WebP/AVIF imágenes
3. Deploy GitHub Pages + CI/CD

## Tareas Técnicas Clave

### Click Tracking (Hook)
```tsx
// useClickTracker.ts
const trackClick = debounce(async (propiedadId: string) => {
  await supabase.from("metricas_clicks").insert({
    propiedad_id: propiedadId,
    tipo_evento: "click",
    sesion_id: getSessionId()
  });
}, 100);
```

### Métricas Dashboard
- Cards: Total, Disponibles, Separadas, Vendidas, Clics, Leads, Avance %
- Colores por estado: verde/ámbar/rojo (glassmorphism)
- Auto-refresh cada 30 segundos via React Query

### SVG Integration
- Plano base: `/public/masterplan.svg`
- Eventos: click en `<path data-property-id="uuid">`
- Overlay coordenadas en Leaflet map

## Seguridad (LPDP Perú)
- Solo datos mínimos en leads: nombre/email/telefono
- RLS filtra por `agencia_id` automáticamente
- Borrado de leads en 30 días

## Definition of Done
- [ ] Build sin errores (`pnpm build`)
- [ ] Tests unitarios con Vitest
- [ ] Deploy en GitHub Pages
- [ ] Dashboard muestra datos reales de Supabase
- [ ] Clicks registrados y visualizados