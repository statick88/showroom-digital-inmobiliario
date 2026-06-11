# Proposal: Masterplan P1 Features

## Intent

P0 delivered interactive parcel overlay, real-time status badges, and WhatsApp deep links inside the 360° tour. P1 adds three capabilities: (1) analytics to track buyer behavior and qualify leads, (2) POI markers showing nearby amenities/attractions, and (3) admin self-service to manage tour-specific data without developer intervention. These close critical gaps vs Latitud360.cl and unlock lead qualification for the sales team.

## Scope

### In Scope
- Analytics event tracking (dwell time, parcel clicks, WhatsApp actions) + admin dashboard
- POI markers rendered as R3F hotspots with icon/label/detail panel
- Admin self-service: CRUD for tour-parcel mapping, POI management, and status/pricing updates
- Supabase `analytics_events` and `tour_pois` tables + RLS policies

### Out of Scope (P2)
- First-person ground-level 360° views per parcel
- AI virtual staging
- Sun path simulation
- AR/VR integration

## Capabilities

### New Capabilities
- `tour-analytics`: Event tracking (dwell, clicks, actions) + Supabase `analytics_events` table + admin dashboard with top parcels and lead scoring
- `poi-markers`: R3F hotspot markers for amenities, roads, attractions with icon + detail panel
- `admin-tour-management`: CRUD for tour-parcel mapping, POI management, status/pricing from admin panel

### Modified Capabilities
- `admin-enhanced`: REQ-AE-03 top-clicked ranking extended to include tour analytics data (parcel clicks, dwell time)

## Approach

**Analytics:** Instrument existing R3F event handlers (`onClick`, `onPointerEnter/Leave`) to insert rows into `analytics_events` via batched writes (5s buffer to avoid perf impact). Dashboard queries aggregate dwell time per parcel, click counts, and WhatsApp action frequency. Follows existing admin layout pattern.

**POI Markers:** New `POIOverlay.tsx` R3F component (parallel to `ParcelOverlay`). Each POI rendered as drei `<Html>` with icon + label. Click opens `POIDetailPanel` (same bottom-sheet pattern as `ParcelDetailPanel`). POIs stored in Supabase `tour_pois` table with `tour_id`, `type` (amenity/road/attraction), `position`, `label`.

**Admin Self-Service:** Extend existing admin CRUD with new views for `tour_pois` and tour-parcel assignments. Separate "Tour Management" tab in admin panel to avoid UX confusion with property CRUD. Uses existing form patterns from `admin-enhanced`.

## Prerequisites

- P0 complete: `ParcelOverlay`, `ParcelDetailPanel`, `useParcelsForTour`, `panoramaCenter` migration
- Supabase Realtime subscription active for lotes

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/presentation/components/virtual-tour/POIOverlay.tsx` | New | R3F component for POI hotspot markers |
| `src/presentation/components/virtual-tour/POIDetailPanel.tsx` | New | Bottom-sheet for POI info on click |
| `src/presentation/components/admin/TourAnalyticsDashboard.tsx` | New | Analytics dashboard with charts + tables |
| `src/presentation/components/admin/TourManagementPanel.tsx` | New | CRUD for POIs and tour-parcel mapping |
| `src/presentation/hooks/useTourAnalytics.ts` | New | Hook for tracking events + querying aggregates |
| `src/data/hooks/usePOIs.ts` | New | Supabase CRUD hook for `tour_pois` table |
| `supabase/migrations/000XX_analytics_events.sql` | New | `analytics_events` table + RLS |
| `supabase/migrations/000XX_tour_pois.sql` | New | `tour_pois` table + RLS |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| High event volume degrades tour performance | Medium | Batch inserts (5s buffer), index on `parcel_id + created_at`, no Realtime on analytics |
| POI marker clutter with many markers | Medium | Frustum-cull off-screen POIs, collapse clusters at low zoom |
| Admin UX confusion mixing tour data with property CRUD | Medium | Separate "Tour Management" tab, clear visual hierarchy |

## Rollback Plan

1. Drop `analytics_events` and `tour_pois` tables
2. Remove event instrumentation from R3F handlers
3. Remove `POIOverlay`, `TourAnalyticsDashboard`, `TourManagementPanel` components
4. Remove `useTourAnalytics`, `usePOIs` hooks
5. Revert `admin-enhanced` if modified
6. No impact on P0 tour functionality

## Dependencies

- `@react-three/drei` `<Html>`, `<Billboard>` (installed)
- Supabase client (configured)
- Existing admin layout components
- shadcn/ui charts (`npx shadcn@latest add chart`)

## Success Criteria

- [ ] Analytics dashboard shows dwell time per parcel, click count, WhatsApp action count
- [ ] POI markers visible in 360° tour with correct positioning
- [ ] Clicking POI opens detail panel with label, description, and type icon
- [ ] Admin can create/edit/delete POIs from admin panel
- [ ] Admin can view tour analytics with sortable/filterable data
- [ ] Event tracking does not impact tour 60fps performance
- [ ] Mobile: POI markers tappable (≥44px hit area), analytics dashboard responsive
- [ ] WCAG 2.1 AA: POI labels accessible, chart color contrast sufficient

## Estimated Effort

**4-6 weeks total:**
- Analytics (events + dashboard): 2 weeks
- POI markers (R3F + data): 1.5 weeks
- Admin self-service (CRUD views): 1 week
- Integration testing + polish: 0.5–1 week
