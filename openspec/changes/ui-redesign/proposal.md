# Proposal: Rediseño UI Showroom Digital Inmobiliario

## Intent
Transformar la interfaz actual para alinearla con los mockups HTML proporcionados, implementando:
1. **Showroom Mapa** - Layout split-screen con filtros en sidebar izquierdo y mapa en derecha
2. **Dashboard Admin** - Panel analítico con métricas, gráfico de avance y ranking de propiedades
3. **Login** - Pantalla de autenticación profesional con branding

## Scope
- Rediseño visual completo de `MapView` y `PropertyFilters`
- Nuevo `MetricasPanel` con cards glassmorphism
- `PropertyDetailPanel` como slide-over desde la derecha
- `AdminLogin` screen con formulario y política LPDP
- Integración de Material Symbols + Lucide icons

## Approach

### Fase 1: Foundation UI
- Crear componentes glass-panel con backdrop-blur
- Configurar tema Tailwind con brand colors (terracotta, teal, amber)
- Layout CSS Grid: sidebar 320px + map flex-1

### Fase 2: Map & Properties
- PropertyMarkers con click tracking integrado
- PropertyCard con estados visuales (Disponible/Separado/Vendido)
- Bottom sheet móvil para PropertyDetailPanel

### Fase 3: Dashboard Analytics
- Cards de métricas con iconos
- Donut chart SVG para distribución de estados
- Tabla ranking top clicks

### Fase 4: Auth & Forms
- Login screen con validación Zod
- Lead form con consentimiento LPDP integrado

## Archivos a modificar
- `src/presentation/components/map/MapView.tsx`
- `src/presentation/components/map/PropertyFilters.tsx`
- `src/presentation/components/map/PropertyCard.tsx`
- `src/presentation/components/map/MetricasPanel.tsx`
- `src/presentation/components/map/PropertyDetailPanel.tsx`
- `src/presentation/components/admin/AdminLogin.tsx` (nuevo)