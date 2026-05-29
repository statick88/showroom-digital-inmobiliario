# Design: Rediseño UI Showroom Digital Inmobiliario

## Architecture Decision Records

### ADR-01: Layout Split-Screen
**Decisión:** Sidebar fijo 320px + Map flex-1  
**Justificación:** Móvil usa bottom sheet, desktop usa sidebar para filtros persistentes

```tsx
// Layout desktop
<div className="hidden lg:flex h-screen">
  <aside className="w-[320px] h-full bg-surface-container-low border-r">
    <PropertyFilters ... />
    <PropertyList ... />
  </aside>
  <section className="flex-1 relative">
    <MapView />
    <PropertyDetailPanel className="absolute right-0 top-0 h-full w-[420px]" />
  </section>
</div>
```

### ADR-02: Glassmorphism Cards
**Decisión:** `glass-panel` con backdrop-filter  
**Implementation:**
```css
.glass-panel {
  background: rgba(255, 248, 243, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 193, 186, 0.3);
}
```

### ADR-03: Marker States Colors
| Estado | Color hex | Tailwind |
|--------|-----------|----------|
| Disponible | `#22C55E` | `bg-tertiary` (#00685d en brand) |
| Separado | `#86513b` | `bg-secondary` |
| Vendido | `#EF4444` | `bg-error` |

### ADR-04: Material Symbols Integration
Usar Google Fonts Material Symbols + fallback a lucide-react:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

## Component Specifications

### PropertyFilters.tsx
- Grid 2-columnas en desktop
- Select dropdown con shadcn/ui
- Input númerico para precio
- Botón limpiar con icono RotateCcw

### MetricasPanel.tsx
- Grid 2/4/6 columnas responsivo
- Card con icono + label + value
- Progress bar para disponibles %

### PropertyDetailPanel.tsx
- Position absolute right-0 top-0
- Transform translateX(100%) → visible
- Grid specs 3-columnas
- Tags features con rounded-full

## API Contracts

### obtener_metricas_dashboard
```sql
RETURNS TABLE (
  total_propiedades bigint,
  disponibles bigint,
  separadas bigint,
  vendidas bigint,
  total_clicks bigint,
  total_leads bigint,
  avance_porcentaje numeric
)
```

### obtener_top_clicks
```sql
RETURNS TABLE (
  id uuid,
  codigo text,
  titulo text,
  total_clicks bigint
)
```