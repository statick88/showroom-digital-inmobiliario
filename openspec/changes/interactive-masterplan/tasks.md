# Tasks — Interactive Masterplan Overlay

> Change: `interactive-masterplan` | Specs: interactive-masterplan (7), property-detail (2 delta)
> Design: openspec/changes/interactive-masterplan/design.md
> Delivery: ask-on-risk

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850–1050 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data model + projection math + color config | PR 1 | base: main. Migration, entity change, hook, colors. ~180 lines. |
| 2 | R3F parcel components (mesh, label, overlay) | PR 2 | base: PR 1 branch. Core 3D rendering. ~320 lines. |
| 3 | Detail panel + integration + WhatsApp | PR 3 | base: PR 2 branch. Panel, content extraction, wiring, tests. ~350 lines. |

## Phase 1: Data Model & Foundation

- [ ] **T-1.1** — Add `panoramaCenter` to `VirtualTourScene` entity
  - **File**: `src/domain/entities/virtual-tour.ts`
  - **Change**: Add `panoramaCenter?: { lat: number; lng: number }` field to the `VirtualTourScene` interface
  - **Acceptance**: TS compiles; existing code unaffected (field optional)
  - **Depends**: —
  - **Effort**: S

- [ ] **T-1.2** — Create Supabase migration `00028_add_panorama_center.sql`
  - **File**: `supabase/migrations/00028_add_panorama_center.sql`
  - **Change**: Add `center_lat_lng` JSONB to each escena element in `tours_360.escenas`. Backfill Ayacucho scenes with `{"lat": -13.163, "lng": -74.224}`. Idempotent check before update.
  - **Acceptance**: `SELECT escenas FROM tours_360` shows `center_lat_lng` in all escena elements
  - **Depends**: —
  - **Effort**: S

- [ ] **T-1.3** — Create `parcel-colors.ts` config
  - **File**: `src/config/parcel-colors.ts`
  - **Change**: Export `PARCEL_COLORS` (Three.js hex per `EstadoLote`) and `PARCEL_BADGE_COLORS` (bg/text per status) matching design spec
  - **Acceptance**: All 3 statuses have color entries; imports work
  - **Depends**: —
  - **Effort**: S

- [ ] **T-1.4** — Create `useParcelProjection.ts` hook
  - **File**: `src/presentation/hooks/useParcelProjection.ts`
  - **Change**: Export `projectToSphere(lng, lat, center, radius)` function converting GeoJSON `[lng, lat]` → `[x, y, z]` on sphere. Unit test: equator, poles, date-line edge cases
  - **Acceptance**: Test passes for known coordinates (Ayacucho center → expected x/y/z)
  - **Depends**: —
  - **Effort**: M

## Phase 2: R3F Parcel Components

- [ ] **T-2.1** — Create `ParcelPolygonMesh.tsx`
  - **File**: `src/presentation/components/virtual-tour/ParcelPolygonMesh.tsx`
  - **Change**: Accept `geojson`, `panoramaCenter`, `status`, `radius` props. Use `useParcelProjection` to convert all polygon vertices to sphere coords. Render `THREE.LineSegments` with color from `PARCEL_COLORS`. Memoize geometry via `useMemo`.
  - **Acceptance**: Lines render at radius 499; color matches status; rotates with camera
  - **Depends**: T-1.3, T-1.4
  - **Effort**: M

- [ ] **T-2.2** — Create `ParcelLabel.tsx`
  - **File**: `src/presentation/components/virtual-tour/ParcelLabel.tsx`
  - **Change**: Use drei `<Html distanceFactor={10}>` with badge showing parcel code, status color (`PARCEL_BADGE_COLORS`), formatted price (S/ or "Consultar"). Min 44×44px touch target. `onClick` callback.
  - **Acceptance**: Badge shows code + color + price; 44px touch target on mobile
  - **Depends**: T-1.3
  - **Effort**: M

- [ ] **T-2.3** — Create `ParcelOverlay.tsx`
  - **File**: `src/presentation/components/virtual-tour/ParcelOverlay.tsx`
  - **Change**: Accept `parcels`, `panoramaCenter`, `onParcelClick` props. Guard: if no `panoramaCenter`, log warning and return null. Map parcels to `<ParcelPolygonMesh>` + `<ParcelLabel>`. Use `<group frustumCulled>` for labels.
  - **Acceptance**: Renders all parcels; graceful degradation without panoramaCenter
  - **Depends**: T-2.1, T-2.2
  - **Effort**: M

## Phase 3: Detail Panel & WhatsApp Integration

- [x] **T-3.1** — Extract `LoteDetailContent.tsx` from FichaTecnicaLote
  - **File**: `src/presentation/components/lotes/LoteDetailContent.tsx` (create) + `src/presentation/components/lotes/FichaTecnicaLote.tsx` (modify)
  - **Change**: Extract presentational content into `LoteDetailContent`. Refactor `FichaTecnicaLote` to render `<LoteDetailContent>` inside its existing modal. No behavior change.
  - **Acceptance**: `FichaTecnicaLote` modal works identically; `LoteDetailContent` renders standalone
  - **Depends**: —
  - **Effort**: M

- [x] **T-3.2** — Create `useWhatsAppTour.ts` hook
  - **File**: `src/presentation/hooks/useWhatsAppTour.ts`
  - **Change**: Wrap `useWhatsApp`. Append `?tour={tourId}#parcel={code}` to message. Respect `lote.moneda` (PEN→S/, USD→$). Delegate tracking to existing mutation.
  - **Acceptance**: wa.me URL contains parcel code, area, price, tour link
  - **Depends**: —
  - **Effort**: S

- [x] **T-3.3** — Create `ParcelDetailPanel.tsx`
  - **File**: `src/presentation/components/virtual-tour/ParcelDetailPanel.tsx`
  - **Change**: Accept `lote`, `tourId`, `isOpen`, `onClose`. Desktop (≥768px): slide-over from right. Mobile (<768px): bottom-sheet (lower 60%). Render `<LoteDetailContent>` + WhatsApp CTA via `useWhatsAppTour`. Backdrop click/swipe-down dismisses.
  - **Acceptance**: Desktop=slide-over, mobile=bottom-sheet; data renders; WhatsApp CTA works
  - **Depends**: T-3.1, T-3.2
  - **Effort**: M

## Phase 4: Integration & Wiring

- [x] **T-4.1** — Create `useParcelsForTour.ts` hook
  - **File**: `src/presentation/hooks/useParcelsForTour.ts`
  - **Change**: Combine `useVirtualTour(tourId)` + `useLotes(tour.proyectoId)` + `useRealtimeLotes()`. Return `{ parcels, panoramaCenter, isLoading }`. Guard: return empty parcels if `panoramaCenter` undefined.
  - **Acceptance**: Returns merged data; real-time invalidation triggers refetch
  - **Depends**: T-1.1
  - **Effort**: M

- [x] **T-4.2** — Update `VirtualTourCanvas.tsx`
  - **File**: `src/presentation/components/virtual-tour/VirtualTourCanvas.tsx`
  - **Change**: Accept `parcels` and `panoramaCenter` props. Render `<ParcelOverlay>` inside `<Canvas>` (after the sphere). Pass `onParcelClick` callback.
  - **Acceptance**: Parcels visible inside Canvas alongside panorama
  - **Depends**: T-2.3
  - **Effort**: S

- [x] **T-4.3** — Update `VirtualTourViewer.tsx`
  - **File**: `src/presentation/components/virtual-tour/VirtualTourViewer.tsx`
  - **Change**: Call `useParcelsForTour(tourId)`. Manage `selectedLote` state. Pass `parcels`, `panoramaCenter`, `onParcelClick` to `VirtualTourCanvas`. Render `<ParcelDetailPanel>`.
  - **Acceptance**: Full flow: click label → panel opens with correct data
  - **Depends**: T-3.3, T-4.1, T-4.2
  - **Effort**: M

## Phase 5: Testing & Verification

- [ ] **T-5.1** — Unit tests for `projectToSphere()`
  - **File**: `src/presentation/hooks/__tests__/useParcelProjection.test.ts`
  - **Acceptance**: Equator, poles, date-line, Ayacucho coords all pass against hand-calculated values
  - **Depends**: T-1.4
  - **Effort**: S

- [ ] **T-5.2** — Unit tests for `useWhatsAppTour`
  - **File**: `src/presentation/hooks/__tests__/useWhatsAppTour.test.ts`
  - **Acceptance**: Message contains code, area, price, tour link; respects moneda
  - **Depends**: T-3.2
  - **Effort**: S

- [ ] **T-5.3** — Unit tests for `PARCEL_COLORS` mapping
  - **File**: `src/config/__tests__/parcel-colors.test.ts`
  - **Acceptance**: All `EstadoLote` values have color + badge entries
  - **Depends**: T-1.3
  - **Effort**: S

- [ ] **T-5.4** — Integration test: real-time overlay update
  - **File**: `src/presentation/components/virtual-tour/__tests__/ParcelOverlay.test.tsx`
  - **Acceptance**: Mock Supabase subscription → status change → ParcelOverlay re-renders with new colors
  - **Depends**: T-2.3
  - **Effort**: M

- [ ] **T-5.5** — Integration test: `useParcelsForTour` data flow
  - **File**: `src/presentation/hooks/__tests__/useParcelsForTour.test.ts`
  - **Acceptance**: Mock useVirtualTour + useLotes → combined output includes parcels + panoramaCenter
  - **Depends**: T-4.1
  - **Effort**: S

- [ ] **T-5.6** — Full verification suite
  - **Acceptance**: `pnpm test && pnpm typecheck && pnpm lint && pnpm build` — 0 failures
  - **Depends**: T-5.1 through T-5.5
  - **Effort**: M
