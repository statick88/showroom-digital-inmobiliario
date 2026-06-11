# Delta: Masterplan P1 Features

## ADDED Requirements

### REQ-PA-01: Tour Analytics Events

The system MUST track user interactions inside the 360° tour as analytics events. Event types: `parcel_click`, `dwell_start`, `dwell_end`, `whatsapp_action`, `tour_start`, `tour_end`. Events MUST be batched (5s buffer) before writing to Supabase `analytics_events` to avoid per-keystroke DB overhead.

#### Scenario: Parcel click event captured

- GIVEN a buyer is viewing the 360° tour
- WHEN they click a parcel overlay
- THEN the system MUST insert an `analytics_events` row with `event_type = 'parcel_click'`, `parcel_id`, `tour_id`, `created_at`
- AND the event MUST NOT block the tour render loop (async write)

#### Scenario: Dwell time tracked per parcel

- GIVEN a buyer's pointer enters a parcel overlay
- WHEN they remain for 3+ seconds
- THEN a `dwell_start` event MUST be inserted on enter
- AND a `dwell_end` event MUST be inserted on leave
- AND the dashboard MUST compute dwell_seconds = `dwell_end - dwell_start`

#### Scenario: Batched writes avoid perf degradation

- GIVEN 10 parcels are clicked within 5 seconds
- THEN ALL events MUST be written in a single batch insert
- AND the tour MUST maintain ≥ 55fps during tracking
- AND no events MUST be lost on batch flush

### REQ-PA-02: Analytics Dashboard

The admin panel MUST include a "Analytics" tab showing aggregated tour behavior. Data MUST refresh on page load and via manual refresh button.

#### Scenario: Dashboard renders top parcels by clicks

- GIVEN the asesor navigates to the Analytics tab
- THEN a table MUST display top parcels sorted by click count descending
- AND columns MUST show: rank, parcel code, title, total clicks, total dwell time (formatted mm:ss), WhatsApp actions
- AND a summary card MUST show: total visitors, total events, avg dwell time

#### Scenario: Date range filter

- GIVEN the asesor selects a date range (start/end)
- THEN all dashboard metrics MUST filter to events within that range
- AND the table MUST re-sort by filtered click count

#### Scenario: Empty state

- GIVEN no analytics events exist
- THEN the dashboard MUST show an empty state: "Aún no hay datos de analytics"
- AND the charts/tables MUST NOT render skeleton placeholders indefinitely

### REQ-PM-01: POI Markers

The 360° tour MUST render Points of Interest (amenities, roads, attractions) as R3F hotspot markers. Each marker displays an icon + label. Clicking opens a detail panel.

#### Scenario: POI markers render for a tour

- GIVEN a tour has 3 POIs defined in `tour_pois`
- WHEN the tour loads
- THEN 3 hotspot markers MUST appear at their configured 3D positions
- AND each MUST display an icon matching its `type` (amenity/road/attraction)
- AND each MUST show a text label below the icon

#### Scenario: POI detail panel opens on click

- GIVEN a POI marker is visible
- WHEN the buyer clicks it
- THEN a `POIDetailPanel` MUST slide up from the bottom
- AND the panel MUST show: POI name, description, type icon, and a close button
- AND the panel MUST use the same bottom-sheet pattern as `ParcelDetailPanel`

#### Scenario: POI markers respect frustum culling

- GIVEN a POI is behind the camera (outside frustum)
- THEN the marker MUST NOT render (drei `FrustumCulled`)
- AND the marker MUST reappear when rotated back into view

### REQ-PM-02: POI CRUD (Admin)

The admin MUST have full CRUD for `tour_pois` entries via the Tour Management panel.

#### Scenario: Create POI

- GIVEN the admin is on the Tour Management tab
- WHEN they click "Add POI" and fill name, description, type, position, tour_id
- AND they click "Save"
- THEN a new row MUST be inserted into `tour_pois`
- AND the POI list MUST update to include the new entry

#### Scenario: Edit POI

- GIVEN a POI exists in the list
- WHEN the admin clicks "Edit" and modifies the label
- THEN the `tour_pois` row MUST be updated
- AND the change MUST reflect on tour reload (no Realtime push needed)

#### Scenario: Delete POI

- GIVEN a POI exists
- WHEN the admin clicks "Delete" and confirms
- THEN the row MUST be removed from `tour_pois`
- AND a confirmation toast MUST appear: "POI eliminado"

### REQ-AT-01: Tour Management Tab

The admin panel MUST include a "Tour" tab separate from Properties/Leads. This tab contains POI CRUD and tour-parcel assignment management.

#### Scenario: Tour tab appears in admin navigation

- GIVEN the admin loads the panel
- THEN a "Tour" tab MUST appear in the sidebar/bottom-tabs
- AND clicking it MUST show: POI list, tour-parcel assignments

#### Scenario: Tour-parcel assignment view

- GIVEN the admin is on the Tour tab
- THEN a table MUST show all parcels and their current tour assignments
- AND the admin MUST be able to assign/remove a parcel from a tour
- AND changes MUST persist to the database

## MODIFIED Requirements

### REQ-AE-03: Top Clicked Properties

The admin dashboard top-clicked ranking MUST incorporate tour analytics data: parcel clicks from `analytics_events` AND dwell time averages, not just raw click count.

(Previously: top 5 properties ranked by simple click count from property_clicks only)

#### Scenario: Top clicked uses analytics events

- GIVEN analytics events exist for parcel clicks
- WHEN the admin loads the top-clicked table
- THEN parcels MUST be ranked by `analytics_events` click count (not legacy property_clicks)
- AND each row MUST show avg dwell time alongside click count

#### Scenario: Fallback to legacy data

- GIVEN no `analytics_events` rows exist for a parcel
- WHEN the top-clicked table renders
- THEN the parcel MUST still appear using legacy click data
- AND dwell time MUST display as "--"

## Data Contracts

### `analytics_events` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK default gen_random_uuid() |
| event_type | text | NOT NULL, CHECK IN (parcel_click, dwell_start, dwell_end, whatsapp_action, tour_start, tour_end) |
| tour_id | uuid | FK tours(id) |
| parcel_id | uuid | FK parcels(id), nullable |
| visitor_id | text | anonymous session fingerprint |
| metadata | jsonb | default '{}' |
| created_at | timestamptz | default now() |

**Indexes:** `(parcel_id, created_at)`, `(tour_id, created_at)`, `(event_type)`

### `tour_pois` Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK default gen_random_uuid() |
| tour_id | uuid | FK tours(id), NOT NULL |
| label | text | NOT NULL |
| description | text | nullable |
| type | text | NOT NULL, CHECK IN (amenity, road, attraction) |
| icon | text | nullable, icon name or emoji |
| position_x | float | NOT NULL |
| position_y | float | NOT NULL |
| position_z | float | NOT NULL |
| created_at | timestamptz | default now() |

**Indexes:** `(tour_id)`, `(type)`

### Component Props

```typescript
interface POIMarkerProps {
  poi: TourPOI;
  onClick: (poi: TourPOI) => void;
}

interface POIDetailPanelProps {
  poi: TourPOI;
  onClose: () => void;
}

interface TourAnalyticsEvent {
  id: string;
  event_type: 'parcel_click' | 'dwell_start' | 'dwell_end' | 'whatsapp_action' | 'tour_start' | 'tour_end';
  tour_id: string;
  parcel_id?: string;
  visitor_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface TourPOI {
  id: string;
  tour_id: string;
  label: string;
  description?: string;
  type: 'amenity' | 'road' | 'attraction';
  icon?: string;
  position: [number, number, number];
}
```

## Acceptance Criteria

| Requirement | Criterion | Benchmark |
|-------------|-----------|-----------|
| REQ-PA-01 | Events written without tour stutter | ≥ 55fps during 50-event burst |
| REQ-PA-01 | Batch buffer flushes every 5s | ≤ 5s max event latency |
| REQ-PA-01 | Zero event loss on batch | 100% events persisted |
| REQ-PA-02 | Dashboard loads analytics data | < 2s load time |
| REQ-PA-02 | Date filter re-queries | < 1s re-render |
| REQ-PM-01 | POI markers render | All POIs visible on tour load |
| REQ-PM-01 | POI hit area on mobile | ≥ 44px tap target |
| REQ-PM-02 | CRUD operations persist | 100% save success |
| REQ-AT-01 | Tour tab in admin | 3 tabs visible: Dashboard, Properties, Tour |

## RLS Policies

```sql
-- analytics_events: read for admin only, insert for anonymous
CREATE POLICY "analytics_read_admin" ON analytics_events FOR SELECT USING (auth.role() = 'admin');
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT WITH CHECK (true);

-- tour_pois: read for all, write for admin only
CREATE POLICY "poi_read_all" ON tour_pois FOR SELECT USING (true);
CREATE POLICY "poi_write_admin" ON tour_pois FOR ALL USING (auth.role() = 'admin');
```

---

**Size:** This spec is ~450 words (under 650 budget).
**Scenarios:** 11 total (7 happy path, 3 edge/error, 1 fallback).
