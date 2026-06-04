# Tasks: Rediseño UI Showroom Digital

## Fase 1: Foundation (3-4h)

- [ ] **TAREA-01**: Actualizar glass-panel CSS en globals.css
  - Agregar `.glass-panel` con backdrop-filter blur(12px)
  - Agregar colores brand: `--status-success`, `--status-warning`, `--status-destructive`

- [ ] **TAREA-02**: Configurar Material Symbols en index.html
  - Agregar Google Fonts link
  - Configurar `font-variation-settings`

- [ ] **TAREA-03**: Reorganizar layout App.tsx a split-screen
  - Sidebar 320px left + Map flex-1 right
  - Bottom sheet mobile para detalle

## Fase 2: Showroom Map (4-5h)

- [ ] **TAREA-04**: Refactor PropertyFilters a sidebar layout
  - Grid 2-columnas
  - Selects para tipo/estado/distrito
  - Input precio máximo
  - Botón limpiar filtros

- [ ] **TAREA-05**: PropertyCard con estados visuales
  - Thumbnail 80x80px
  - Badge estado (disponible: verde, separado: ámbar, vendido: rojo)
  - Precio en formato PEN/USD

- [ ] **TAREA-06**: Click tracking integrado
  - Hook useClickTracker con debounce
  - Registrar en metricas_clicks table

## Fase 3: Dashboard Admin (3-4h)

- [ ] **TAREA-07**: MetricasPanel con 6 cards
  - Total/Disponibles/Separados/Vendidos/Clics/Avance %
  - Iconos Material Symbols
  - Progress bar para disponibles

- [ ] **TAREA-08**: Donut chart SVG
  - Segmentos por estado
  - Texto centro con total
  - Leyenda flotante

- [ ] **TAREA-09**: Top clicks ranking table
  - Columnas: Rank, Código, Propiedad, Clicks
  - Imagen thumbnail + título
  - Sort por clicks descendente

## Fase 4: Property Detail (3-4h)

- [ ] **TAREA-10**: Slide-over panel derecho
  - Hero image con overlay
  - Specs grid (área/dorm/baños)
  - Descripción + features tags

- [ ] **TAREA-11**: LeadForm con LPDP
  - Validación con Zod
  - Checkbox política privacidad
  - Submit → crear lead

## Fase 5: Auth (2h)

- [ ] **TAREA-12**: AdminLogin screen
  - Email/password form
  - Remember me checkbox
  - Link recuperar contraseña
  - Loading states

## Fase 6: Testing & Polish (2h)

- [ ] **TAREA-13**: Tests Vitest para hooks
  - useClickTracker debounce test
  - useMetricas query test

- [ ] **TAREA-14**: Ajustes responsive
  - Mobile bottom sheet
  - Desktop sidebar fijo
  - Breakpoints lg/md/sm