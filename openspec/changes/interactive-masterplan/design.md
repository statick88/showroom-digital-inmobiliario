# Design: Interactive Masterplan Overlay

## Technical Approach

Render parcel overlays **inside the R3F `<Canvas>`** alongside the equirectangular texture sphere. GeoJSON polygon boundaries are projected from lat/lng to spherical coordinates relative to `panoramaCenter`, rendered at radius 499 (inside the 500-radius texture). Labels use drei `<Html>` for DOM-in-3D badges. Detail panel reuses `FichaTecnicaLote` content in a new wrapper that adapts to tour context (bottom-sheet on mobile, slide-over on desktop). Real-time status sync leverages existing `useRealtimeLotes` which invalidates the `["lotes"]` React Query cache.

References: `openspec/changes/interactive-masterplan/specs/interactive-masterplan/spec.md` (REQ-IM-01..07), `openspec/changes/interactive-masterplan/specs/property-detail/spec.md` (REQ-PD-01/02 delta).

## Architecture Decisions

### Decision: R3F Canvas Overlay vs DOM-to-Camera Sync

**Choice**: Render parcels inside `<Canvas>` using Three.js primitives (Option A from exploration).

**Alternatives considered**:
- DOM overlay synced to camera via CSS transforms — rejected: jitter on rotation, manual frustum math, no native z-ordering
- Separate Leaflet map overlaid on canvas — rejected: two map engines, impossible alignment

**Rationale**: Three.js handles projection natively. Parcels rotate with camera automatically. No DOM sync bugs. `<Html>` from drei provides accessible DOM labels inside Canvas.

### Decision: ParcelPolygonMesh as Line Segments vs Extruded Geometry

**Choice**: `THREE.LineSegments` for parcel boundaries (wireframe only, no fill).

**Alternatives considered**:
- Extruded `THREE.ShapeGeometry` with透明 fill — rejected: z-fighting with sphere texture, visual clutter
- `THREE.EdgesGeometry` on filled mesh — rejected: overkill, same visual result as lines

**Rationale**: Lines are lightweight (no triangulation), clearly visible against the panorama, and avoid depth conflicts with the texture sphere. Fill opacity from `polygon-styles.ts` is approximated via line color only; a future P1 can add semi-transparent mesh fill.

### Decision: Refactor FichaTecnicaLote for Dual Context

**Choice**: Extract `FichaTecnicaLote` content into a presentational `LoteDetailContent` component. Both the existing modal wrapper and the new `ParcelDetailPanel` render this content.

**Alternatives considered**:
- Duplicate FichaTecnicaLote inside ParcelDetailPanel — rejected: violates DRY, two code paths to maintain
- Make FichaTecnicaLote accept `embedded` prop to suppress its own modal — rejected: pollutes existing component with tour-specific logic

**Rationale**: Clean separation. `LoteDetailContent` is the pure data-display component. `FichaTecnicaLote` remains the standalone modal (existing behavior unchanged). `ParcelDetailPanel` is the tour-specific chrome (bottom-sheet/slide-over + WhatsApp CTA with tour deep link).

### Decision: WhatsApp Deep Link Extension

**Choice**: Create `useWhatsAppTour` hook that wraps `useWhatsApp` and appends `?tour={tourId}#parcel={code}` to the message.

**Alternatives considered**:
- Modify `useWhatsApp` directly — rejected: breaks existing non-tour usage, couples tour logic into generic hook
- Inline the URL construction in ParcelDetailPanel — rejected: duplicates tracking logic

**Rationale**: Composition over mutation. `useWhatsAppTour` calls `useWhatsApp` internally, adds tour context to the message, and delegates tracking to the existing mutation.

## Data Flow

```
VirtualTourViewer
  ├── useVirtualTour(tourId) → scene data (includes panoramaCenter)
  ├── useLotes(tour.proyectoId) → parcel polygons + status
  ├── useRealtimeLotes() → live status subscription
  └── VirtualTourCanvas parcels={lotes} panoramaCenter={scene.panoramaCenter}
       └── <Canvas>
            └── ParcelOverlay
                 ├── ParcelPolygonMesh × N (THREE.LineSegments)
                 └── ParcelLabel × N (drei <Html>)
                      └── onClick → ParcelDetailPanel
                           ├── LoteDetailContent (extracted from FichaTecnicaLote)
                           └── useWhatsAppTour (deep link + tracking)
```

Real-time update flow:
```
Admin changes lote status → Supabase DB
  → useRealtimeLotes subscription fires
  → React Query invalidates ["lotes"] cache
  → useLotes refetches → VirtualTourViewer re-renders
  → ParcelOverlay receives updated parcels prop
  → ParcelPolygonMesh color updates (via useMemo on status)
  → ParcelLabel badge text/color updates
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/domain/entities/virtual-tour.ts` | Modify | Add `panoramaCenter?: { lat: number; lng: number }` to `VirtualTourScene` |
| `supabase/migrations/00028_add_panorama_center.sql` | Create | Add `center_lat_lng` JSONB to escenas, backfill Ayacucho coordinates |
| `src/presentation/components/virtual-tour/ParcelOverlay.tsx` | Create | R3F component orchestrating all parcel meshes + labels |
| `src/presentation/components/virtual-tour/ParcelPolygonMesh.tsx` | Create | Single parcel boundary as `THREE.LineSegments` geometry |
| `src/presentation/components/virtual-tour/ParcelLabel.tsx` | Create | Status badge + price via drei `<Html>` |
| `src/presentation/components/virtual-tour/ParcelDetailPanel.tsx` | Create | Bottom-sheet (mobile) / slide-over (desktop) wrapper |
| `src/presentation/components/lotes/LoteDetailContent.tsx` | Create | Extracted presentational content from FichaTecnicaLote |
| `src/presentation/hooks/useParcelsForTour.ts` | Create | Combines useVirtualTour + useLotes + useRealtimeLotes |
| `src/presentation/hooks/useWhatsAppTour.ts` | Create | Wraps useWhatsApp with tour deep link context |
| `src/presentation/components/virtual-tour/VirtualTourCanvas.tsx` | Modify | Accept `parcels` + `panoramaCenter` props, render `<ParcelOverlay>` inside Canvas |
| `src/presentation/components/virtual-tour/VirtualTourViewer.tsx` | Modify | Fetch lotes via `useParcelsForTour`, pass to canvas |
| `src/presentation/components/lotes/FichaTecnicaLote.tsx` | Modify | Refactor to render `<LoteDetailContent>` (no behavior change) |
| `src/config/parcel-colors.ts` | Create | R3F-compatible color mapping (replaces Leaflet polygon-styles for 3D context) |

## Interfaces / Contracts

### PanoramaCenter (VirtualTourScene extension)
```typescript
interface VirtualTourScene {
  // ... existing fields
  panoramaCenter?: { lat: number; lng: number };
}
```

### ParcelOverlay Props
```typescript
interface ParcelOverlayProps {
  parcels: Lote[];
  panoramaCenter: { lat: number; lng: number };
  onParcelClick: (lote: Lote) => void;
}
```

### ParcelPolygonMesh Props
```typescript
interface ParcelPolygonMeshProps {
  geojson: number[][][];  // Lote.poligonoCoords format: [[[lng, lat], ...]]
  panoramaCenter: { lat: number; lng: number };
  status: EstadoLote;
  radius?: number; // default 499
}
```

### ParcelLabel Props
```typescript
interface ParcelLabelProps {
  lote: Lote;
  position: [number, number, number];
  onClick: (lote: Lote) => void;
}
```

### ParcelDetailPanel Props
```typescript
interface ParcelDetailPanelProps {
  lote: Lote | null;
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

### LoteDetailContent Props (extracted from FichaTecnicaLote)
```typescript
interface LoteDetailContentProps {
  lote: Lote;
  onClose: () => void;
  modoVendedor?: boolean;
}
```

### parcel-colors.ts (R3F Three.js colors)
```typescript
import type { EstadoLote } from "@/domain/entities/lote";

export const PARCEL_COLORS: Record<EstadoLote, string> = {
  disponible: "#166534",  // green-700
  reservado: "#854d0e",   // yellow-800
  vendido: "#991b1b",     // red-800
};

// Badge background colors (lighter for readability on <Html>)
export const PARCEL_BADGE_COLORS: Record<EstadoLote, { bg: string; text: string }> = {
  disponible: { bg: "#dcfce7", text: "#166534" },
  reservado: { bg: "#fef9c3", text: "#854d0e" },
  vendido: { bg: "#fee2e2", text: "#991b1b" },
};
```

### Projection Math (useParcelProjection)
```typescript
// GeoJSON [lng, lat] → Three.js [x, y, z] on sphere
function projectToSphere(
  lng: number,
  lat: number,
  center: { lat: number; lng: number },
  radius: number = 499
): [number, number, number] {
  const phi = (90 - (lat - center.lat)) * (Math.PI / 180);
  const theta = (lng - center.lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}
```

### WhatsApp Tour Deep Link
```typescript
// useWhatsAppTour extends useWhatsApp with tour context
function buildTourMessage(
  lote: Lote,
  tourId: string
): string {
  const price = lote.moneda === "PEN" ? `S/ ${lote.precio.toLocaleString("es-PE")}` : `$ ${lote.precio.toLocaleString("es-PE")}`;
  const tourLink = `${window.location.origin}?tour=${tourId}#parcel=${lote.codigo}`;
  return `Hola, me interesa el lote "${lote.codigo}" (${lote.areaTotal} m²) a ${price}. ${tourLink}`;
}
```

## Sequence Diagrams

### User Opens Tour → Overlay Loads

```
User        VirtualTourViewer    useParcelsForTour    VirtualTourCanvas    ParcelOverlay
  │               │                    │                    │                   │
  │──navigate───▶│                    │                    │                   │
  │               │──useVirtualTour──▶│                    │                   │
  │               │──useLotes────────▶│                    │                   │
  │               │──useRealtimeLotes▶│                    │                   │
  │               │◀─parcels+center───│                    │                   │
  │               │──render──────────────────────────────▶│                   │
  │               │                    │                    │──<ParcelOverlay>▶│
  │               │                    │                    │                   │──ParcelPolygonMesh×N
  │               │                    │                    │                   │──ParcelLabel×N
  │               │                    │                    │                   │
  │◀─360°+overlays│                    │                    │                   │
```

### User Clicks Parcel → Detail Panel Opens

```
User        ParcelLabel    ParcelDetailPanel    LoteDetailContent    useWhatsAppTour
  │              │               │                    │                   │
  │──click─────▶│               │                    │                   │
  │              │──onClick(lote)▶                   │                   │
  │              │               │──setSelectedLote   │                   │
  │              │               │──render───────────▶│                   │
  │              │               │                    │──display lote data│
  │              │               │                    │                   │
  │◀─detail panel────────────────│                    │                   │
  │              │               │                    │                   │
  │──"WhatsApp"─▶               │                    │                   │
  │              │               │                    │──openWhatsApp()──▶│
  │              │               │                    │                   │──wa.me URL
  │              │               │                    │                   │──trackClick
```

### Admin Updates Status → Real-time Badge Update

```
Admin       Supabase    useRealtimeLotes    React Query    VirtualTourViewer    ParcelOverlay
  │              │              │                │               │                  │
  │──UPDATE────▶│              │                │               │                  │
  │  status     │──payload───▶│                │               │                  │
  │              │              │──invalidate──▶│               │                  │
  │              │              │  ["lotes"]     │──refetch────▶│                  │
  │              │              │                │               │──new parcels────▶│
  │              │              │                │               │                  │──re-render
  │              │              │                │               │                  │  badges+lines
  │              │              │                │               │                  │
  │◀─badge color changes (≤2s)────────────────────────────────────────────────────│
```

## Performance Strategy

### InstancedMesh for Boundaries (P1 optimization)

For tours with >30 parcels, group parcels by status and render each group as a single `THREE.InstancedMesh` with shared geometry. Each instance gets its own transform matrix. Reduces draw calls from N to 3 (one per status).

### Frustum Culling for Labels

`<Html>` from drei already performs frustum checks — labels behind the camera are hidden automatically. Add `frustumCulled={true}` on the parent `<group>` containing all labels.

### Mobile LOD (Level of Detail)

Detect mobile via `navigator.maxTouchPoints > 0` or viewport width < 768px. On mobile:
- Skip `<Html>` labels for parcels behind the camera (manual dot-product check against camera direction)
- Use `<Billboard>` instead of `<Html>` for labels (GPU-rendered, no DOM overhead)
- Reduce sphere segments from 60×40 to 32×20

### Geometry Caching

`useMemo` on the projected line geometry per parcel. Recompute only when `poligonoCoords` or `panoramaCenter` changes (both are stable after load).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `projectToSphere()` math | Known coordinates → verify x/y/z against hand-calculated values. Test edge cases: equator, poles, date line |
| Unit | `buildTourMessage()` format | Mock lote + tourId → verify message contains code, area, price, tour link |
| Unit | `PARCEL_COLORS` mapping | Verify all `EstadoLote` values have corresponding color entries |
| Integration | Real-time overlay update | Mock Supabase subscription → trigger status change → verify ParcelOverlay re-renders with new colors |
| Integration | `useParcelsForTour` data flow | Mock useVirtualTour + useLotes → verify combined output includes parcels and panoramaCenter |
| E2E | User opens tour, sees overlays | Playwright: navigate to tour URL → wait for Canvas → verify parcel badges visible |
| E2E | Click parcel, detail panel opens | Playwright: click parcel badge → verify FichaTecnicaLote content + WhatsApp button present |
| E2E | WhatsApp deep link | Playwright: click WhatsApp → verify wa.me URL contains parcel code + tour link |

## Migration / Rollout

### Supabase Migration: `00028_add_panorama_center.sql`

```sql
-- Add center_lat_lng to each element in the escenas JSONB array
-- Backfill existing Ayacucho tour scenes

UPDATE public.tours_360
SET escenas = (
  SELECT jsonb_agg(
    elem || '"center_lat_lng": {"lat": -13.163, "lng": -74.224}'::jsonb
  )
  FROM jsonb_array_elements(escenas) AS elem
)
WHERE id IN (
  SELECT id FROM public.tours_360
  WHERE escenas != '[]'::jsonb
);
```

### Rollback Plan

1. Remove `<ParcelOverlay>` render from `VirtualTourCanvas.tsx`
2. Remove `parcels`/`panoramaCenter` props from canvas and viewer
3. Delete new component files (ParcelOverlay, ParcelPolygonMesh, ParcelLabel, ParcelDetailPanel, LoteDetailContent)
4. Delete hooks (useParcelsForTour, useWhatsAppTour)
5. Revert `virtual-tour.ts` entity (remove `panoramaCenter`)
6. Revert Supabase migration (`UPDATE ... SET escenas = ...` to strip `center_lat_lng`)
7. No data loss — lotes table untouched, tour functionality unchanged

### Feature Flag

No feature flag needed — `panoramaCenter` is optional. Tours without it gracefully degrade (no overlays rendered, console warning logged).

## Open Questions

- [ ] Should the `panoramaCenter` backfill migration be idempotent (check if field exists before adding)? Current approach updates all rows — safe but overwrites if manually set.
- [ ] For 100+ parcels, should we implement distance-based label culling (only show labels within N meters of camera)? Current spec says "frustum cull" but doesn't specify distance threshold.
- [ ] Should `LoteDetailContent` be extracted into a shared location (`src/presentation/components/lotes/`) or kept co-located with FichaTecnicaLote? Shared location avoids import cycles but changes the file structure.
- [ ] The existing `useWhatsApp` hardcodes `S/` prefix. Should `useWhatsAppTour` respect `lote.moneda` for USD parcels?
