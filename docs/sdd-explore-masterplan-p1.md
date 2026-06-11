# SDD Exploration: P1 Features for Interactive Masterplan

**Date:** 2026-06-09
**Change Name:** `masterplan-p1-features`
**Status:** Exploration Complete — Ready for Proposal

---

## 1. Current State

### 1.1 Admin Panel Architecture

The admin panel (`AdminDashboard.tsx`) is a tab-based SPA with 6 tabs:

```
AdminDashboard
├── DashboardTab        — useMetricas() → DonutChart, ProgressBar, TopClickedTable
├── PropiedadesTab      — usePropiedades() → CRUD table with inline status dropdown
├── LeadsTab            — LeadsTable → useLeads() legacy hook
├── UsuariosTab         — UsuariosPanel → useUsuarios()
├── AuditLogTab         — AuditLogPanel → useAuditLog()
└── VirtualToursTab     — VirtualToursPanel → useVirtualTours() + VirtualTourForm
```

**Key patterns:**
- All data fetching via TanStack Query hooks (`useQuery`/`useMutation`)
- Repositories follow Clean Architecture: `domain/repositories/` → `data/repositories/`
- Supabase as backend, RLS policies per table
- Realtime subscriptions via `useRealtimeLotes`, `useRealtimePropiedades`
- UI components: shadcn/ui Dialog, Button, Pagination + custom Icon system

### 1.2 Existing Analytics Infrastructure

**Already built (P0):**

| Component | File | What it does |
|-----------|------|--------------|
| `useClickTracker` | `useClickTracker.ts` | Tracks `click`, `view`, `whatsapp_click`, `time_spent` events via `metricasRepository.registrarClick()` |
| `useLeadScoring` | `useLeadScoring.ts` | Computes 0-100 score per visitor via `leadScoresRepository.compute()` |
| `useTopClicks` | `useTopClicks.ts` | Fetches top-clicked parcels via `metricasRepository.obtenerTopClicks()` |
| `TopClickedTable` | `TopClickedTable.tsx` | Admin table showing most-clicked parcels |
| `DonutChart` | `DonutChart.tsx` | Status distribution visualization |
| `ProgressBar` | `ProgressBar.tsx` | Sales target progress |

**Database tables (migrations 00021-00022):**

```sql
-- lead_events: tracks visitor engagement
lead_events (
  id UUID, visitor_id TEXT, property_id UUID,
  event_type TEXT CHECK (event_type IN ('view','whatsapp_click','time_spent','repeat_visit')),
  metadata JSONB, created_at TIMESTAMPTZ
)

-- lead_scores: computed engagement scores
lead_scores (
  id UUID, visitor_id TEXT UNIQUE, score INTEGER (0-100),
  breakdown JSONB, computed_at TIMESTAMPTZ
)

-- compute_lead_score() RPC: weighs views×10 + clicks×25 + time/3 + repeats×15
```

### 1.3 Existing Tour Admin CRUD

**VirtualToursPanel** (`VirtualToursPanel.tsx`):
- Table listing all tours with search + estado filter
- Create/Edit via `VirtualTourForm` dialog
- Publish/Unpublish toggle, Delete with confirmation
- States: `borrador` → `publicado` → `archivado`

**VirtualTourForm** (`VirtualTourForm.tsx`):
- Basic info: nombre, proyecto, descripción, estado
- Scene editor: dynamic list with expand/collapse
  - Per scene: yaw, pitch, FOV, 360° image upload, thumbnail upload
  - Hotspot editor per scene: label, target scene, yaw, pitch
- Uses `ImageUploader` for Cloudinary uploads

### 1.4 Tour Viewer Architecture

```
VirtualTourViewer
├── useVirtualTour(tourId) → scene data
├── useParcelsForTour(tourId) → parcels + panoramaCenter
├── VirtualTourCanvas (R3F)
│   ├── SphereWithTexture (radius 500)
│   ├── ParcelOverlay (P0 — completed)
│   │   ├── ParcelPolygonMesh × N (3D boundary lines)
│   │   └── ParcelLabel × N (Html badges with status/price)
│   ├── AutoRotateCamera
│   └── OrbitControls
└── Scene navigation bar (thumbnail strip)
```

**Key:** `ParcelOverlay` uses `projectToSphere()` to convert lat/lng → 3D coordinates on the sphere. This same projection can be reused for POI markers.

---

## 2. P1 Feature Analysis

### 2.1 Analytics Dashboard

**What exists:**
- Event tracking: `lead_events` table + `useClickTracker` hook ✅
- Lead scoring: `lead_scores` table + `useLeadScoring` hook ✅
- Top clicks: `TopClickedTable` component ✅
- Donut chart: status distribution ✅
- Sales progress: `ProgressBar` ✅

**What's missing for P1:**

| Gap | Current State | Needed |
|-----|---------------|--------|
| **Dwell time per parcel** | `time_spent` event type exists but no UI to visualize it | Admin chart: avg time per parcel, time distribution |
| **Scene-level analytics** | Not tracked at all | Track which scenes visitors view, time per scene |
| **Visitor journey** | Individual events exist but no session reconstruction | Session timeline: scene sequence + events per scene |
| **Date-range filtering** | Hardcoded "Últimos 30 días" label, no actual filtering | Filter by date range, compare periods |
| **Export** | `ExportarAuditLogCSV` exists for audit log | Extend to analytics export |
| **Real-time dashboard** | Static query, no live updates | Add realtime subscription for events |

**Integration points:**
- `useClickTracker` already tracks `time_spent` — extend to include `sceneId` in metadata
- `lead_events` table already has `metadata JSONB` — add `scene_id`, `tour_id` to metadata
- New hook: `useTourAnalytics(tourId, dateRange)` — aggregates events per tour
- New component: `TourAnalyticsPanel` — charts for dwell time, scene views, visitor flow
- Add to `AdminDashboard` as new tab or sub-tab of Virtual Tours

**Recommended approach:**
1. Extend `lead_events` metadata to include `tour_id` and `scene_id`
2. Create `useTourAnalytics` hook with date-range filtering
3. Create `TourAnalyticsPanel` component with:
   - Dwell time per parcel (bar chart)
   - Scene view counts (bar chart)
   - Visitor journey timeline (table)
   - Date range picker
4. Add to admin as sub-tab of Virtual Tours or standalone Analytics tab

### 2.2 Admin Self-Service (Tour-Specific Data)

**What exists:**
- `VirtualToursPanel`: CRUD for tours (nombre, estado, escenas)
- `VirtualTourForm`: scene editor with hotspots
- Tour-scene relationship: scenes stored as JSONB array in `tours_360.escenas`

**What's missing for P1:**

| Gap | Current State | Needed |
|-----|---------------|--------|
| **Parcel-tour linking** | `tours_360.propiedad_id` exists but unused in UI | Associate parcels with tours for analytics |
| **Scene-level parcel visibility** | Not stored | Which parcels are visible in each scene |
| **POI management** | No UI | Create/edit/delete POIs per scene |
| **Tour settings** | Basic only | Auto-rotate speed, initial view, branding |
| **Bulk operations** | None | Import/export tour configurations |
| **Tour duplication** | None | Clone a tour for new projects |

**Integration points:**
- `VirtualTourForm` already manages scenes — extend to add POI editor per scene
- `tours_360.escenas` JSONB already supports extensible metadata — add `pois` array
- New admin component: `TourSettingsPanel` — tour-level configuration
- New admin component: `POIManager` — CRUD for POIs within scene editor

**Recommended approach:**
1. Extend `VirtualTourScene` entity to include `pois: POI[]`
2. Add POI editor to `VirtualTourForm` (within scene expand)
3. Create `TourSettingsPanel` for tour-level config
4. Add parcel-tour association UI (multi-select parcels per tour)
5. Add tour duplication utility

### 2.3 POI Markers

**What exists:**
- `VirtualTourHotspot` entity: `{ id, yaw, pitch, targetSceneId, label, type, content }`
- `ParcelOverlay`: renders 3D objects on sphere using `projectToSphere()`
- `ParcelLabel`: `<Html>` badges with status/price

**What's missing for P1:**

| Gap | Current State | Needed |
|-----|---------------|--------|
| **POI entity** | Not defined | `{ id, yaw, pitch, type, title, description, icon, media? }` |
| **POI rendering** | Not implemented | Render POI markers in R3F canvas |
| **POI interaction** | Not implemented | Click → popup with info |
| **POI admin** | Not implemented | CRUD in VirtualTourForm |
| **POI types** | Not defined | amenity, landmark, service, etc. |
| **POI icons** | Not defined | Custom icons per type |

**Integration points:**
- Reuse `projectToSphere()` from `useParcelProjection.ts` for positioning
- Reuse `<Html>` from drei (same as `ParcelLabel`) for POI popups
- Extend `VirtualTourScene` entity: add `pois: POI[]`
- Extend `VirtualTourForm`: add POI editor within scene expand section
- New component: `POIMarker.tsx` — R3F component for single POI
- New component: `POIOverlay.tsx` — orchestrates all POIs in scene

**Recommended approach:**
1. Define `POI` entity in `domain/entities/poi.ts`
2. Add `pois` field to `VirtualTourScene` entity
3. Create `POIMarker.tsx` — R3F `<Html>` component with icon + popup
4. Create `POIOverlay.tsx` — renders all POIs for current scene
5. Add POI editor to `VirtualTourForm` scene section
6. Create POI type enum: `amenity | landmark | service | entrance | parking`

---

## 3. Affected Areas

### Files to Modify

| File | Change | P1 Feature |
|------|--------|------------|
| `src/domain/entities/virtual-tour.ts` | Add `POI` interface, extend `VirtualTourScene` with `pois` | POI, Admin |
| `src/domain/entities/lead.ts` | Extend `EventType` with `scene_view`, `tour_start`, `tour_end` | Analytics |
| `src/presentation/components/admin/AdminDashboard.tsx` | Add Analytics tab | Analytics |
| `src/presentation/components/admin/VirtualTourForm.tsx` | Add POI editor per scene | POI, Admin |
| `src/presentation/components/admin/VirtualToursPanel.tsx` | Add analytics link per tour | Analytics |
| `src/presentation/components/virtual-tour/ParcelOverlay.tsx` | Import POIOverlay | POI |
| `supabase/migrations/000XX_*.sql` | New tables/columns | All |

### Files to Create

| File | Purpose | P1 Feature |
|------|---------|------------|
| `src/domain/entities/poi.ts` | POI entity definition | POI |
| `src/presentation/components/virtual-tour/POIMarker.tsx` | Single POI marker in R3F | POI |
| `src/presentation/components/virtual-tour/POIOverlay.tsx` | Orchestrates all POIs | POI |
| `src/presentation/components/admin/TourAnalyticsPanel.tsx` | Analytics dashboard per tour | Analytics |
| `src/presentation/hooks/useTourAnalytics.ts` | Analytics data hook | Analytics |
| `src/presentation/components/admin/POIEditor.tsx` | POI CRUD in form | POI, Admin |

### Reused (No Changes)

| File | Why |
|------|-----|
| `useParcelProjection.ts` | `projectToSphere()` reused for POI positioning |
| `ParcelLabel.tsx` | `<Html>` pattern reused for POI popups |
| `useClickTracker.ts` | Extended with scene_id, tour_id metadata |
| `leadEventsRepository` | Extended with new event types |
| `ImageUploader` | Reused for POI media uploads |

---

## 4. Data Model Changes

### 4.1 POI Entity

```typescript
// src/domain/entities/poi.ts
export type POIType = 'amenity' | 'landmark' | 'service' | 'entrance' | 'parking' | 'custom';

export interface POI {
  id: string;
  sceneId: string;
  yaw: number;
  pitch: number;
  type: POIType;
  title: string;
  description?: string;
  icon?: string;           // Custom icon URL or emoji
  mediaUrl?: string;       // Image/video for popup
  linkUrl?: string;        // External link
  metadata?: Record<string, unknown>;
}
```

### 4.2 Extended VirtualTourScene

```typescript
// Add to existing VirtualTourScene interface
interface VirtualTourScene {
  // ... existing fields
  pois?: POI[];                    // NEW: Points of interest
  visibleParcelIds?: string[];     // NEW: Which parcels are visible
}
```

### 4.3 Extended lead_events Metadata

```sql
-- Add to lead_events metadata JSONB:
-- { "tour_id": "uuid", "scene_id": "uuid", "parcel_id": "uuid" }

-- New event types:
-- 'scene_view' — visitor views a scene
-- 'tour_start' — visitor opens a tour
-- 'tour_end' — visitor closes a tour
-- 'poi_click' — visitor clicks a POI
```

### 4.4 New Migration

```sql
-- 00030_poi_and_analytics.sql

-- Add pois column to escenas (JSONB array within existing escenas)
-- No new table needed — POIs stored within tours_360.escenas JSONB

-- Extend lead_events with new event types
ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_event_type_check;
ALTER TABLE lead_events ADD CONSTRAINT lead_events_event_type_check
  CHECK (event_type IN ('view', 'whatsapp_click', 'time_spent', 'repeat_visit',
                         'scene_view', 'tour_start', 'tour_end', 'poi_click'));

-- Add tour_analytics view for aggregated stats
CREATE VIEW tour_analytics AS
SELECT
  (metadata->>'tour_id')::uuid as tour_id,
  event_type,
  count(*) as event_count,
  count(distinct visitor_id) as unique_visitors,
  date_trunc('day', created_at) as event_date
FROM lead_events
WHERE metadata->>'tour_id' IS NOT NULL
GROUP BY tour_id, event_type, event_date;
```

---

## 5. Recommended Technical Approach

### 5.1 Analytics Dashboard

**Approach:** Extend existing infrastructure, add visualization layer.

1. **Extend event tracking** — Add `scene_id`, `tour_id` to `useClickTracker` metadata
2. **Create `useTourAnalytics` hook** — Query `lead_events` grouped by tour/scene/date
3. **Create `TourAnalyticsPanel`** — Recharts charts (bar, line, pie)
4. **Add to admin** — New "Analytics" tab or sub-tab of Virtual Tours
5. **Add date range filtering** — Reuse existing filter pattern from PropiedadesTab

**Complexity:** Medium — mostly new UI on top of existing data pipeline.

### 5.2 Admin Self-Service

**Approach:** Extend `VirtualTourForm` with POI editor + settings panel.

1. **Extend `VirtualTourForm`** — Add POI section within scene editor
2. **Create `POIEditor`** — Form fields for POI type, title, position, media
3. **Create `TourSettingsPanel`** — Tour-level config (auto-rotate, branding)
4. **Add parcel-tour linking** — Multi-select in tour form

**Complexity:** Medium — extending existing form patterns.

### 5.3 POI Markers

**Approach:** Mirror `ParcelOverlay` architecture for POIs.

1. **Create `POIMarker.tsx`** — `<Html>` component with icon + click popup
2. **Create `POIOverlay.tsx`** — Render all POIs for current scene
3. **Integrate in `VirtualTourCanvas`** — Add `<POIOverlay>` inside `<Canvas>`
4. **Position via `projectToSphere()`** — Same projection as parcels

**Complexity:** Low-Medium — well-established patterns from ParcelOverlay.

---

## 6. Risk Areas

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Analytics performance** — querying `lead_events` with date ranges on large datasets | Medium | Add composite index on `(event_type, created_at)`. Use materialized view for dashboard. Paginate queries. |
| **POI storage in JSONB** — POIs inside `escenas` JSONB array may hit size limits | Low | JSONB is efficient for structured data. If needed, extract to separate `tour_pois` table later. |
| **POI projection accuracy** — same lat/lng → sphere projection challenges as parcels | Low | Reuse proven `projectToSphere()` from ParcelOverlay. Already tested with real coordinates. |
| **Form complexity** — VirtualTourForm already 424 lines, adding POI editor makes it larger | Medium | Extract `POIEditor` as separate component. Consider splitting form into sections/tabs. |
| **Realtime analytics overhead** — subscribing to lead_events for live dashboard | Medium | Use polling (30s interval) instead of realtime for analytics. Realtime only for critical events. |
| **Mobile POI interaction** — small POI markers on phone screens | Medium | Use larger hit areas (44px min). Show detail panel as bottom sheet on mobile. |

---

## 7. Implementation Order

### Recommended Sequence

1. **POI Entity + Migration** (Day 1)
   - Define `POI` interface
   - Add `pois` to `VirtualTourScene`
   - Create migration for new event types

2. **POI Markers** (Days 2-3)
   - `POIMarker.tsx` + `POIOverlay.tsx`
   - Integrate in `VirtualTourCanvas`
   - Test projection accuracy

3. **POI Admin CRUD** (Days 4-5)
   - `POIEditor.tsx` component
   - Extend `VirtualTourForm` with POI section
   - Test create/edit/delete flow

4. **Analytics Tracking** (Days 6-7)
   - Extend `useClickTracker` with tour/scene metadata
   - Add new event types to tracking
   - Test event recording

5. **Analytics Dashboard** (Days 8-10)
   - `useTourAnalytics` hook
   - `TourAnalyticsPanel` component
   - Date range filtering
   - Add to admin panel

6. **Admin Self-Service** (Days 11-12)
   - `TourSettingsPanel` component
   - Parcel-tour association UI
   - Tour duplication utility

---

## 8. Ready for Proposal

**Yes — ready for proposal.**

All three P1 features have clear integration points in the existing codebase:
- **Analytics** — extend existing `lead_events` + `useClickTracker` infrastructure
- **Admin Self-Service** — extend existing `VirtualTourForm` pattern
- **POI Markers** — mirror proven `ParcelOverlay` architecture

The data model gaps are well-defined and require minimal migration work. The main risk is form complexity in `VirtualTourForm` (already 424 lines), which should be mitigated by extracting `POIEditor` as a separate component.

**What the orchestrator should tell the user:**
- P1 features build directly on P0 infrastructure — no architectural changes needed
- POI markers reuse the same projection math as parcels (proven, tested)
- Analytics dashboard extends existing event tracking — just add visualization
- Admin self-service follows established CRUD patterns from VirtualToursPanel
- Estimated effort: 2-3 weeks for all three P1 features

---

*Generated by sdd-explore | SDD Exploration Phase*
