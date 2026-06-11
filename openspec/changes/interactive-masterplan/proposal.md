# Proposal: Interactive Masterplan Overlay

## Intent

The 360° virtual tour viewer (`VirtualTourCanvas`) is currently a pure equirectangular panorama renderer with zero interactivity — users can rotate the camera but cannot identify, query, or act on individual parcels. Research from Latitud360.cl shows +55% conversion when interactive overlays are added to aerial tours, and no such product exists in Peru. This change adds an R3F-based parcel overlay inside the Canvas so users can see parcel boundaries, status, pricing, and initiate WhatsApp inquiries directly from the 360° view.

## Scope

### In Scope
- `ParcelOverlay.tsx` — R3F component rendering all parcel meshes + labels inside `<Canvas>`
- `ParcelPolygonMesh.tsx` — 3D line/mesh geometry per parcel boundary (GeoJSON → sphere projection)
- `ParcelLabel.tsx` — `<Html>` badge with status color, price, and code per parcel
- `ParcelDetailPanel.tsx` — Bottom-sheet (mobile) / side-panel (desktop) with `FichaTecnicaLote` + WhatsApp CTA
- `useParcelsForTour.ts` — Hook combining `useVirtualTour` + `useLotes` + `useRealtimeLotes`
- `panoramaCenter` data model addition to `VirtualTourScene` entity + Supabase migration
- WhatsApp deep links per parcel (`?tour=...#parcel=L-01`)
- Real-time status sync via existing `useRealtimeLotes`

### Out of Scope (P1/P2)
- Event analytics (dwell time, click tracking) — P1
- Admin panel for parcel-tour mapping — P1
- Ground-level 360° hotspot transitions per parcel — P2
- AI virtual staging — P2
- Sun path simulation — P2

## Capabilities

### New Capabilities
- `interactive-masterplan`: R3F parcel overlay inside 360° Canvas — GeoJSON-to-sphere projection, status badges, pricing labels, click-to-detail, WhatsApp deep links, real-time status sync

### Modified Capabilities
- `property-detail`: REQ-PD-01/02 modal/slide-over must accept a new entry point from tour overlay (parcel click in 360° view triggers same detail panel)

## Prerequisites

**Hard blocker:** `panoramaCenter` (lat/lng of the equirectangular projection center) is NOT stored per scene. Without it, GeoJSON polygons cannot be accurately projected onto the sphere.

Resolution: Add `center_lat_lng` JSONB column to `tours_360.escenas` array items via Supabase migration. Backfill with known coordinates for existing tours (Ayacucho project: -13.163, -74.224).

## Approach

Render parcel overlays **inside the R3F `<Canvas>`** (Option A from exploration). This avoids manual DOM-to-camera sync and lets Three.js handle projection natively.

**Projection math:** Convert GeoJSON lat/lng → spherical coordinates relative to `panoramaCenter`, render at radius 499 (inside the texture sphere at 500). Use `THREE.Line` for boundaries, `<Html distanceFactor={10}>` from drei for labels.

**Data flow:**
```
VirtualTourViewer
  ├── useVirtualTour(tourId) → scene data
  ├── useLotes(tour.proyectoId) → parcel polygons + status
  ├── useRealtimeLotes() → live status subscription
  └── VirtualTourCanvas parcels={lotes} panoramaCenter={scene.centerLatLng}
       └── ParcelOverlay
            ├── ParcelPolygonMesh × N (boundaries)
            └── ParcelLabel × N (badges)
                 └── onClick → ParcelDetailPanel
                      ├── FichaTecnicaLote (reused)
                      └── useWhatsApp (extended)
```

**Reuse existing:** `FichaTecnicaLote`, `ConsultaLote`, `useWhatsApp`, `useRealtimeLotes`, `polygon-styles.ts` (status→color mapping). Zero duplication.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/presentation/components/virtual-tour/ParcelOverlay.tsx` | New | R3F component orchestrating all parcel meshes + labels |
| `src/presentation/components/virtual-tour/ParcelPolygonMesh.tsx` | New | Single parcel boundary as 3D line geometry |
| `src/presentation/components/virtual-tour/ParcelLabel.tsx` | New | Status badge + price (drei `<Html>`) |
| `src/presentation/components/virtual-tour/ParcelDetailPanel.tsx` | New | Slide-over/modal with FichaTecnicaLote + WhatsApp |
| `src/presentation/hooks/useParcelsForTour.ts` | New | Combines useVirtualTour + useLotes + useRealtimeLotes |
| `src/domain/entities/virtual-tour.ts` | Modified | Add `panoramaCenter?: {lat, lng}` to VirtualTourScene |
| `src/presentation/components/virtual-tour/VirtualTourCanvas.tsx` | Modified | Accept `parcels` prop, render `<ParcelOverlay>` inside Canvas |
| `src/presentation/components/virtual-tour/VirtualTourViewer.tsx` | Modified | Fetch lotes, pass to canvas |
| `supabase/migrations/000XX_add_panorama_center.sql` | New | Add `center_lat_lng` to escenas JSONB |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GeoJSON-to-sphere projection inaccuracy near edges | Medium | Peru is near equator (−13° lat) → minimal equirectangular distortion. Validate with real Ayacucho coordinates. |
| Performance with 100+ parcels (meshes + labels in R3F) | Medium | Use `InstancedMesh` for same-status parcels. Frustum-cull labels. `<Billboard>` fallback for low-end devices. |
| `panoramaCenter` backfill for existing tours | High | Manual config per project. Admin UI for setting center is P1 — P0 uses hardcoded values per tour. |
| Mobile touch targets too small (parcel labels) | Medium | Minimum 44px hit area. Bottom-sheet detail panel on mobile (no hover依赖). |
| Sphere radius mismatch with existing camera | Low | Render parcels at radius 499 (inside 500-radius texture sphere). Trivial offset. |

## Rollback Plan

1. Remove `<ParcelOverlay>` render from `VirtualTourCanvas.tsx`
2. Remove `parcels` prop from `VirtualTourCanvas` and `VirtualTourViewer`
3. Delete new component files (`ParcelOverlay`, `ParcelPolygonMesh`, `ParcelLabel`, `ParcelDetailPanel`)
4. Delete `useParcelsForTour.ts` hook
5. Revert `virtual-tour.ts` entity (remove `panoramaCenter`)
6. Revert Supabase migration (drop `center_lat_lng` column)
7. No data loss — existing tour functionality unchanged, lotes table untouched

## Dependencies

- `@react-three/fiber` + `@react-three/drei` (already installed)
- `three` (already installed)
- `useLotes`, `useRealtimeLotes`, `FichaTecnicaLote`, `useWhatsApp` (all exist)
- Supabase migration capability (existing migration pattern)

## Success Criteria

- [ ] User sees parcel boundaries rendered as colored lines inside 360° tour
- [ ] Parcel labels show status (color-coded), price, and code
- [ ] Clicking a parcel label opens detail panel with FichaTecnicaLote + WhatsApp CTA
- [ ] WhatsApp message includes parcel code, area, price, and tour deep link
- [ ] Real-time status updates reflect within 2s of admin change
- [ ] Camera rotation moves parcels naturally (projected inside Canvas, no DOM sync)
- [ ] Mobile: parcels tappable (≥44px hit area), detail panel opens as bottom-sheet
- [ ] Performance: 60fps on mid-range mobile with ≤50 parcels
- [ ] Existing tour functionality (pan, zoom, scene nav) unchanged
