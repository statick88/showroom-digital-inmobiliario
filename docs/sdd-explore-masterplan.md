# SDD Exploration: Interactive Masterplan Overlay for 360° Virtual Tours

**Date:** 2026-06-09
**Status:** Exploration Complete — Ready for Proposal

---

## 1. Current Architecture

### 1.1 VirtualTourCanvas (`VirtualTourCanvas.tsx`)

```
VirtualTourCanvas (281 lines)
├── AutoRotateCamera — useFrame-based Y-axis rotation
├── SphereWithTexture — THREE.SphereGeometry(500, 60, 40) + EquirectangularReflectionMapping
├── OrbitControls — pan disabled, zoom 0.5–3, damping, rotateSpeed -0.3
├── UI overlays — fullscreen toggle, auto-rotate toggle, keyboard hints
└── Props: scene (VirtualTourScene), onLoad, onFullscreenChange
```

**Key architectural facts:**
- Camera at origin `(0, 0, 0.1)`, sphere radius 500, rendered on `BackSide`
- Texture loaded via `THREE.TextureLoader` with KTX2 fallback
- No hotspot rendering — the entity `VirtualTourHotspot` exists in domain but is NOT consumed by the canvas component
- No parcel overlay — pure panorama viewer today
- `Suspense` wrapper around `SphereWithTexture` only

### 1.2 VirtualTourViewer (`VirtualTourViewer.tsx`)

```
VirtualTourViewer
├── useVirtualTour(tourId) → React Query hook
├── Scene management: currentScene, sceneHistory, navigateToScene, navigateBack
├── Lazy-loads VirtualTourCanvas
├── Scene navigation bar (thumbnail strip)
├── Back button (history-based)
└── VirtualTourCompass (fullscreen only)
```

**Key gap:** `tour.escenas[].hotspots` are fetched from Supabase but never rendered. The viewer has scene navigation but no parcel interaction.

### 1.3 Existing Data Models

**Lote entity** (already has what we need):
```typescript
interface Lote {
  id: string;
  proyectoId: string;
  codigo: string;           // "Lote 127", "MZ-A LT-3"
  areaTotal: number;        // m²
  precio: number;
  moneda: "PEN" | "USD";
  estado: "disponible" | "reservado" | "vendido";
  poligonoCoords: number[][][];  // GeoJSON Polygon [[lng,lat],...]
  imagenPlano?: string;
  descripcion?: string;
  orden: number;
}
```

**VirtualTourScene entity:**
```typescript
interface VirtualTourScene {
  id: string;
  textureUrl: string;
  thumbnailUrl: string;
  yaw: number;
  pitch: number;
  fov: number;
  hotspots?: VirtualTourHotspot[];  // EXISTS but unused
}
```

**Database tables:**
- `lotes` — has `proyecto_id`, `poligono_coords` (GeoJSON), `estado`, `precio`, `codigo`
- `tours_360` — has `proyecto_id`, `escenas` (JSONB array), linked to same proyecto
- Both are in the same Supabase project, same `proyecto_id` FK

### 1.4 Existing Infrastructure

| Component | Status | Relevant? |
|-----------|--------|-----------|
| `useRealtimeLotes` | ✅ Exists, invalidates `["lotes"]` cache | YES — reuse for live status |
| `useLotes(proyectoId)` | ✅ Exists, fetches by proyecto | YES — fetch parcels for overlay |
| `FichaTecnicaLote` | ✅ Exists, full parcel detail modal | YES — reuse for parcel detail |
| `ConsultaLote` | ✅ Exists, lead capture form | YES — reuse for inquiry CTA |
| `useWhatsApp` | ✅ Exists, tracks clicks + opens wa.me | YES — extend for deep links |
| `MasterPlanOverlay` | ✅ Exists, Leaflet ImageOverlay | NO — different rendering context |
| `MapaLotes` | ✅ Exists, Leaflet GeoJSON polygons | NO — 2D map, not 360° |
| `polygon-styles.ts` | ✅ Exists, status→color mapping | YES — reuse color scheme |
| `Tour360` | ✅ Exists, legacy Pannellum viewer | NO — separate component |

---

## 2. Integration Points

### 2.1 Where to Add the Overlay Layer

**Option A: Inside `VirtualTourCanvas` R3F scene (RECOMMENDED)**
```
<Canvas>
  <SphereWithTexture />        ← existing
  <ParcelOverlay />            ← NEW: renders inside R3F
    ├── ParcelPolygonMesh × N  ← 3D geometry per parcel
    └── ParcelLabel × N        ← <Html> or <Billboard> per parcel
  <AutoRotateCamera />         ← existing
  <OrbitControls />            ← existing
</Canvas>
```

**Why:** Rendering inside the R3F scene means parcels are naturally projected onto the sphere. Camera rotation automatically moves parcels. No external DOM overlay sync needed.

**Option B: HTML overlay on top of Canvas**
```
<div className="relative">
  <Canvas />                   ← existing
  <div className="absolute">   ← NEW: HTML overlay
    <ParcelBadges />           ← positioned via CSS
  </div>
</div>
```

**Why not:** Requires manual sync between camera rotation and badge positions. Fragile, breaks on resize.

### 2.2 Data Flow for Overlay

```
VirtualTourViewer
  ├── useVirtualTour(tourId) → scene data
  └── NEW: useLotes(tour.proyectoId) → parcel polygons + status
      └── Pass to VirtualTourCanvas as new prop: parcels={lotes}
          └── VirtualTourCanvas renders ParcelOverlay inside <Canvas>
```

**Critical link:** `VirtualTour.proyectoId` ↔ `Lote.proyectoId` — same FK, same project. The tour and its parcels already share the same `proyecto_id`.

### 2.3 Projection Strategy

The 360° aerial panorama is an equirectangular image mapped onto a sphere. Parcels are GeoJSON polygons in lat/lng. To project parcels onto the sphere:

1. **Convert lat/lng → spherical coordinates (yaw, pitch)**
   - `yaw = lng * (π / 180)` relative to panorama center
   - `pitch = lat * (π / 180)` relative to panorama center
   - Offset by panorama center coordinates (from `VirtualTourScene.yaw/pitch`)

2. **Render parcel boundaries as 3D line geometry**
   - Create `THREE.Line` or `THREE.Mesh` for each polygon ring
   - Position at sphere surface (radius 499, just inside the texture sphere)

3. **Render labels/badges as `<Html>` from drei**
   - `<Html distanceFactor={10}>` positioned at parcel centroid
   - Status badge + price + code
   - Click handler opens `FichaTecnicaLote`

---

## 3. Data Model Gaps

### 3.1 Missing: Parcel-to-Scene Mapping

**Problem:** A project has multiple tour scenes (aerial + ground views) and multiple parcels. We need to know which parcels are visible in which scene.

**Current:** `tours_360.escenas` is a flat JSONB array. No parcel association per scene.

**Needed:** Add to `VirtualTourScene`:
```typescript
interface VirtualTourScene {
  // ... existing fields
  visibleParcelIds?: string[];  // NEW: which parcels are visible in this scene
  centerLatLng?: { lat: number; lng: number };  // NEW: equirectangular center projection
}
```

**DB migration needed:** Add `centerLatLng` to escenas JSONB, or add a join table `tours_360_escenas_lotes`.

### 3.2 Missing: Panorama Center Coordinates

**Problem:** The equirectangular panorama has a "center" in lat/lng that determines how GeoJSON coordinates project onto the sphere. This is NOT stored today.

**Current:** `VirtualTourScene.yaw/pitch` are initial camera angles, not geo-center.

**Needed:** Store the geo-center of each aerial panorama:
```typescript
// In VirtualTourScene or tour metadata
panoramaCenter?: { lat: number; lng: number; zoom: number };
```

**Without this, we cannot accurately project GeoJSON polygons onto the sphere.**

### 3.3 Missing: WhatsApp Deep Links Per Parcel

**Current:** `useWhatsApp` takes `(propertyName, price, phone, propertyId)` and generates a generic wa.me link.

**Needed:** Extend to include parcel code and tour deep link:
```typescript
// New: parcel-specific WhatsApp message
const message = `Hola, me interesa el lote "${lote.codigo}" (${lote.areaTotal}m²) a ${formatPrice(lote.precio, lote.moneda)} en el proyecto "${tour.nombre}". ¿Podría darme más información?`;
// Deep link: add #parcel=L-01 to URL
const deepLink = `${window.location.origin}?tour=${tourId}#parcel=${lote.id}`;
```

---

## 4. Recommended Technical Approach

### Phase 1: P0 — Interactive Parcel Overlay (2–3 weeks)

**Components to create:**
1. `ParcelOverlay.tsx` — R3F component, renders inside `<Canvas>`
2. `ParcelPolygonMesh.tsx` — 3D mesh/line for one parcel boundary
3. `ParcelLabel.tsx` — `<Html>` badge with status + price + code
4. `ParcelDetailPanel.tsx` — Slide-over or modal with `FichaTecnicaLote` + WhatsApp CTA
5. `useParcelOverlay.ts` — Hook to fetch parcels for current tour's proyecto

**Data flow:**
```
VirtualTourViewer
  ├── useVirtualTour(tourId)
  ├── useLotes(tour.proyectoId)         ← NEW
  ├── useRealtimeLotes()                ← NEW (live status)
  └── VirtualTourCanvas
       └── ParcelOverlay parcels={lotes}
            ├── ParcelPolygonMesh × N
            └── ParcelLabel × N
                 └── onClick → ParcelDetailPanel
                      ├── FichaTecnicaLote (reused)
                      └── WhatsApp deep link
```

**Projection math:**
```typescript
function latLngToSphere(lat: number, lng: number, center: {lat: number, lng: number}, radius: number) {
  const phi = (90 - (lat - center.lat)) * (Math.PI / 180);
  const theta = (lng - center.lng) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

### Phase 2: P1 — Analytics + Admin (4–6 weeks)
- Event tracking (dwell time per parcel, clicks, WhatsApp opens)
- Admin panel for parcel tour data (status, pricing, POIs)
- URL hash routing for deep links (`#parcel=L-01`)

### Phase 3: P2 — Immersion (8–12 weeks)
- Ground-level 360° per parcel (hotspot transitions)
- AI virtual staging
- Sun path simulation

---

## 5. Risk Areas

| Risk | Severity | Mitigation |
|------|----------|------------|
| **GeoJSON-to-sphere projection accuracy** — equirectangular distortion means parcels near poles (unlikely for Peru) or far from center will be stretched | Medium | Store `panoramaCenter` per scene. Test with real Ayacucho coordinates (-13.163, -74.224). Peru is near equator → minimal distortion. |
| **Performance with many parcels** — 100+ parcels with polygon meshes + labels in R3F | Medium | Use `InstancedMesh` for parcels with same status. Lazy-render labels only for visible parcels (frustum culling). Use `<Billboard>` instead of `<Html>` for better perf. |
| **Sphere radius mismatch** — current sphere is radius 500, parcels must render just inside | Low | Render parcels at radius 499 (inside texture sphere). Trivial offset. |
| **No `panoramaCenter` in existing data** — can't project without knowing where the panorama "points" | High | This is a HARD BLOCKER for accurate projection. Must add to DB schema + admin UI before overlay works. Alternative: hardcode center per project (manual config). |
| **Hotspot rendering not implemented** — entity exists but canvas ignores it | Low | Implement hotspot rendering in same PR as parcel overlay. Shared `<Html>` infrastructure. |
| **Mobile touch interaction** — tapping small parcel labels on phone screens | Medium | Use larger hit areas (44px min). Show detail panel bottom-sheet style on mobile. |
| **Realtime subscription conflicts** — `useRealtimeLotes` invalidates `["lotes"]` cache globally | Low | Scope the subscription to `proyecto_id` filter. Already has infrastructure for filtered subscriptions. |

---

## 6. Files to Modify/Create

### New Files
```
src/presentation/components/virtual-tour/
  ├── ParcelOverlay.tsx              ← R3F component, orchestrates all parcels
  ├── ParcelPolygonMesh.tsx          ← Single parcel boundary as 3D mesh
  ├── ParcelLabel.tsx                ← Status badge + price (Html from drei)
  ├── ParcelDetailPanel.tsx          ← Modal/slide-over with FichaTecnicaLote + WhatsApp
  └── __tests__/
      ├── ParcelOverlay.test.tsx
      └── ParcelLabel.test.tsx

src/presentation/hooks/
  └── useParcelsForTour.ts           ← Combines useVirtualTour + useLotes

src/domain/entities/
  └── (extend) virtual-tour.ts       ← Add panoramaCenter to VirtualTourScene
```

### Modified Files
```
src/presentation/components/virtual-tour/VirtualTourCanvas.tsx
  ← Add parcels prop, render <ParcelOverlay> inside <Canvas>

src/presentation/components/virtual-tour/VirtualTourViewer.tsx
  ← Fetch lotes via useLotes(tour.proyectoId), pass to canvas

src/domain/entities/virtual-tour.ts
  ← Add panoramaCenter?: {lat, lng} to VirtualTourScene

src/presentation/hooks/use-virtual-tour.ts
  ← (no changes needed, existing hooks sufficient)

supabase/migrations/000XX_add_panorama_center.sql
  ← Add panorama_center JSONB to tours_360 or escenas
```

### Reused (No Changes)
```
src/presentation/components/lotes/FichaTecnicaLote.tsx   ← parcel detail modal
src/presentation/components/lotes/ConsultaLote.tsx        ← lead capture form
src/presentation/hooks/useWhatsApp.ts                    ← WhatsApp integration
src/presentation/hooks/useRealtimeLotes.ts               ← live status updates
src/config/polygon-styles.ts                             ← status→color mapping
src/presentation/hooks/useLotes.ts                       ← parcel data fetching
```

---

## 7. Recommendation

**Proceed with Phase 1 (P0)** using Option A (overlay inside R3F canvas). The data model is almost complete — `lotes` table has polygon coordinates, status, and pricing. The critical missing piece is `panoramaCenter` per scene (geo-center of the equirectangular projection).

**Approach:**
1. Add `panoramaCenter` to `VirtualTourScene` entity + DB migration
2. Create `ParcelOverlay.tsx` that renders polygons as 3D geometry inside `<Canvas>`
3. Use `<Html>` from drei for status badges (reuses existing `StatusChip` component)
4. Reuse `FichaTecnicaLote` for detail panel
5. Extend `useWhatsApp` for parcel-specific deep links
6. Wire `useRealtimeLotes` for live status sync

**Estimated effort:** 2–3 weeks for P0 (interactive overlay + real-time status + WhatsApp deep links).

---

*Generated by sdd-explore | SDD Exploration Phase*
