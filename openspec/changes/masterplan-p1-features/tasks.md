# Tasks: Masterplan P1 Features

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data model + entities + repositories | PR 1 | base: main; migrations, domain types, Supabase CRUD |
| 2 | Analytics event tracking | PR 2 | base: PR 1 branch; useTourAnalytics hook + config |
| 3 | POI components + hooks | PR 3 | base: PR 2 branch; overlay, markers, detail panel, usePOIs |
| 4 | Admin dashboard + integration | PR 4 | base: PR 3 branch; charts, management tab, wiring into existing views |

## Phase 1: Data Model & Infrastructure

- [ ] 1.1 Create `supabase/migrations/00030_analytics_events.sql` — table, indexes (parcel_created, tour_created, type), RLS (admin read, anon insert), `get_analytics_summary` RPC
- [ ] 1.2 Create `supabase/migrations/00031_tour_pois.sql` — table, indexes (tour, type), RLS (read all, admin write)
- [ ] 1.3 Create `src/domain/entities/analytics.ts` — `TourAnalyticsEvent`, `AnalyticsAggregate`, `AnalyticsSummary` interfaces, `EventType` union
- [ ] 1.4 Create `src/domain/entities/tour-poi.ts` — `TourPOI`, `CreatePOIData`, `UpdatePOIData` interfaces, `POIType` union
- [ ] 1.5 Create `src/data/repositories/analytics.repository.impl.ts` — `insertEvents()`, `getAggregates(tourId, dateRange)` using RPC
- [ ] 1.6 Create `src/data/repositories/tour-pois.repository.impl.ts` — `list(tourId)`, `create()`, `update()`, `delete()` for `tour_pois`

## Phase 2: Analytics Event Tracking

- [x] 2.1 Create `src/config/poi-icons.ts` — `POI_ICONS` mapping: amenity → 🏢, road → 🛣️, attraction → 🎯
- [x] 2.2 Create `src/presentation/hooks/useTourAnalytics.ts` — `track()`, `flush()`, `visitorId`; 5s timer + 50-event threshold buffer; `beforeunload` sendBeacon fallback
- [x] 2.3 Unit test: push 49 events → verify no insert; push 1 more → verify batch insert with 50 events
- [x] 2.4 Unit test: mount → track events → unmount → verify flush called on cleanup

## Phase 3: POI Components

- [x] 3.1 Create `src/presentation/hooks/usePOIs.ts` — React Query hook: `pois`, `createPOI`, `updatePOI`, `deletePOI`, cache invalidation on mutation
- [x] 3.2 Create `src/presentation/components/virtual-tour/POIMarker.tsx` — single POI hotspot using drei `<Html>`, icon from `poi-icons.ts`, click handler
- [x] 3.3 Create `src/presentation/components/virtual-tour/POIOverlay.tsx` — R3F `<group>` rendering `POIMarker` per POI, frustum culling, receives `pois` + `onPOIClick` props
- [x] 3.4 Create `src/presentation/components/virtual-tour/POIDetailPanel.tsx` — bottom-sheet for POI info (label, description, type, icon), mirrors `ParcelDetailPanel` pattern
- [x] 3.5 Unit test: `usePOIs` CRUD — mock Supabase, verify create/update/delete calls and cache invalidation

## Phase 4: Admin Dashboard & Management

- [ ] 4.1 Create `src/presentation/hooks/useAnalyticsAggregates.ts` — calls RPC `get_analytics_summary`, returns top parcels, event type breakdown, summary stats
- [ ] 4.2 Create `src/presentation/components/admin/TourAnalyticsDashboard.tsx` — shadcn `BarChart` (top parcels by clicks), `PieChart` (events by type), `DataTable` (sortable parcel rows), date range selector
- [ ] 4.3 Create `src/presentation/components/admin/TourManagementTab.tsx` — POI list with create/edit/delete, tour-parcel assignment section, form for POI fields
- [ ] 4.4 Modify `src/presentation/components/admin/AdminDashboard.tsx` — add "Analytics" tab (read-only dashboard) and "Tour" tab (CRUD) to sidebar + mobile bar
- [ ] 4.5 Unit test: `useAnalyticsAggregates` — mock RPC, verify returned aggregates match expected shape

## Phase 5: Integration & Wiring

- [ ] 5.1 Modify `src/presentation/components/virtual-tour/VirtualTourViewer.tsx` — wire `useTourAnalytics(tourId)` + `usePOIs(tourId)`, pass `track` to event handlers, render `POIOverlay`
- [ ] 5.2 Modify `src/presentation/components/virtual-tour/VirtualTourCanvas.tsx` — accept `pois` + `onPOIClick` props, render `POIOverlay` inside Canvas
- [ ] 5.3 Integration test: `POIOverlay` renders markers — render with mock POIs, verify correct number of `<Html>` elements in R3F Canvas
- [ ] 5.4 Integration test: `POIDetailPanel` opens on click — render, click marker, verify panel visible with POI data
- [ ] 5.5 Integration test: event tracking end-to-end — mount `VirtualTourViewer`, simulate parcel click, verify event in mock buffer

## Phase 6: E2E & Final Verification

- [ ] 6.1 E2E: Admin creates POI — navigate to Tour tab → Add POI → fill form → Save → navigate to tour → verify marker visible
- [ ] 6.2 E2E: Analytics dashboard shows data — navigate to Analytics tab → verify charts render with aggregated data
- [ ] 6.3 E2E: Date range filter — select date range → verify table re-sorts and chart updates
- [ ] 6.4 Verify no regression: existing P0 tour viewer loads, parcels display, WhatsApp CTA works
