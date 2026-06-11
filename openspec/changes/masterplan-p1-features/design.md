# Design: Masterplan P1 Features

## Technical Approach

Build on the P0 R3F tour foundation. Analytics events are captured by instrumenting existing `onClick`/`onPointerEnter`/`onPointerLeave` handlers in `ParcelOverlay` and `ParcelLabel`, batched into a 5-second buffer, and flushed to Supabase `analytics_events` via a single `INSERT`. POI markers follow the same R3F `<Html>` pattern as `ParcelLabel`, rendered in a parallel `POIOverlay` group. Admin CRUD reuses existing `AdminDashboard` tab infrastructure and `supabase-virtual-tour.repository.impl` patterns. Dashboard charts use shadcn/ui `BarChart` and `PieChart` with recharts underneath.

## Architecture Decisions

### Decision: Batched Event Buffer vs Per-Event Insert

**Choice**: In-memory array flushed every 5 seconds or on 50-event threshold.

**Alternatives considered**: Per-event Supabase insert — rejected: network overhead per click, blocks render loop at high interaction rates. Supabase Edge Function batching — rejected: adds latency, requires additional infra.

**Rationale**: Client-side batching reduces DB round-trips by 10-50x during active touring. 5s buffer keeps events near-realtime for dashboard. Threshold flush prevents unbounded memory growth. `navigator.sendBeacon` fallback on `beforeunload` prevents event loss.

### Decision: POIOverlay Parallel to ParcelOverlay

**Choice**: Separate `<POIOverlay>` component rendered inside the same `<Canvas>`, receiving `pois` and `onPOIClick` props.

**Alternatives considered**: Merge POIs into `ParcelOverlay` — rejected: different data sources (`tour_pois` vs `lotes`), different CRUD lifecycle. DOM overlay outside Canvas — rejected: same jitter issues solved in P0.

**Rationale**: Clean separation of concerns. POIs and parcels have independent data flows (POIs don't change with lotes status). Parallel group structure allows independent frustum culling and future toggle control.

### Decision: shadcn/ui Charts for Dashboard

**Choice**: Install `npx shadcn@latest add chart` for recharts-based BarChart, PieChart, and DataTable components.

**Alternatives considered**: Chart.js via `react-chartjs-2` — rejected: shadcn/ui already in project, recharts has better TypeScript support and composable patterns. D3 raw — rejected: too low-level for dashboard charts.

**Rationale**: Consistent with existing shadcn/ui component library. Recharts renders as SVG, accessible by default. shadcn chart wrappers provide pre-styled responsive containers.

### Decision: Separate "Tour" Tab (Not Merged with Analytics)

**Choice**: Two new tabs: "Analytics" (REQ-PA-02) and "Tour" (REQ-AT-01) for admin.

**Alternatives considered**: Single "Tour Analytics" tab combining both — rejected: confuses management (CRUD) with observation (charts). Nested sub-tabs — rejected: mobile UX complexity.

**Rationale**: Analytics is read-only dashboard. Tour tab is write-only CRUD. Different mental models, different user flows. Follows existing pattern: Dashboard (read), Propiedades (write), Leads (read/write).

## Data Flow

```
Tour View (buyer):
  VirtualTourViewer
    ├── useParcelsForTour(tourId) → parcels + panoramaCenter
    ├── useTourAnalytics(tourId) → eventTracker (track, flush)
    ├── usePOIs(tourId) → pois[]
    └── VirtualTourCanvas
         └── <Canvas>
              ├── ParcelOverlay → onClick → eventTracker.track('parcel_click')
              ├── POIOverlay → onClick → eventTracker.track('poi_click')
              └── OrbitControls

Event Buffer Flow:
  track(event) → buffer[] → 5s timer OR 50-event threshold
    → supabase.from('analytics_events').insert(buffer)
    → buffer = []

Admin Dashboard:
  AdminDashboard
    ├── Tab: "Analytics" → TourAnalyticsDashboard
    │     ├── useAnalyticsAggregates(tourId, dateRange)
    │     │     → supabase.rpc('get_analytics_summary')
    │     ├── BarChart (top parcels by clicks)
    │     ├── PieChart (events by type)
    │     └── DataTable (sortable parcel rows)
    └── Tab: "Tour" → TourManagementTab
          ├── TourPOIList → CRUD via usePOIs
          └── TourParcelAssign → assign/remove parcels
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00030_analytics_events.sql` | Create | `analytics_events` table, indexes, RLS, RPC |
| `supabase/migrations/00031_tour_pois.sql` | Create | `tour_pois` table, indexes, RLS |
| `src/domain/entities/analytics.ts` | Create | `TourAnalyticsEvent`, `AnalyticsAggregate` interfaces |
| `src/domain/entities/tour-poi.ts` | Create | `TourPOI`, `CreatePOIData`, `UpdatePOIData` interfaces |
| `src/data/repositories/analytics.repository.impl.ts` | Create | Supabase CRUD + aggregate queries for analytics |
| `src/data/repositories/tour-pois.repository.impl.ts` | Create | Supabase CRUD for `tour_pois` |
| `src/presentation/hooks/useTourAnalytics.ts` | Create | Event batching hook with `track()` and `flush()` |
| `src/presentation/hooks/usePOIs.ts` | Create | React Query hook for POI CRUD + cache |
| `src/presentation/hooks/useAnalyticsAggregates.ts` | Create | Dashboard data hook (top parcels, summaries) |
| `src/presentation/components/virtual-tour/POIOverlay.tsx` | Create | R3F group orchestrating POI markers |
| `src/presentation/components/virtual-tour/POIMarker.tsx` | Create | Single POI hotspot (drei `<Html>` + icon) |
| `src/presentation/components/virtual-tour/POIDetailPanel.tsx` | Create | Bottom-sheet for POI info (mirrors ParcelDetailPanel) |
| `src/presentation/components/admin/TourAnalyticsDashboard.tsx` | Create | Charts + DataTable for analytics |
| `src/presentation/components/admin/TourManagementTab.tsx` | Create | POI list CRUD + tour-parcel assignments |
| `src/presentation/components/virtual-tour/VirtualTourViewer.tsx` | Modify | Wire `useTourAnalytics` + `usePOIs`, render `POIOverlay` |
| `src/presentation/components/virtual-tour/VirtualTourCanvas.tsx` | Modify | Accept `pois` + `onPOIClick` props, render `POIOverlay` |
| `src/presentation/components/admin/AdminDashboard.tsx` | Modify | Add "Analytics" and "Tour" tabs to sidebar + mobile bar |
| `src/config/poi-icons.ts` | Create | Icon mapping for POI types (amenity/road/attraction) |

## Interfaces / Contracts

### TourAnalyticsEvent
```typescript
type EventType = 'parcel_click' | 'dwell_start' | 'dwell_end' | 'whatsapp_action' | 'tour_start' | 'tour_end';

interface TourAnalyticsEvent {
  id: string;
  event_type: EventType;
  tour_id: string;
  parcel_id?: string;
  visitor_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface AnalyticsAggregate {
  parcel_id: string;
  parcel_code: string;
  total_clicks: number;
  total_dwell_seconds: number;
  whatsapp_actions: number;
}

interface AnalyticsSummary {
  total_visitors: number;
  total_events: number;
  avg_dwell_seconds: number;
}
```

### TourPOI
```typescript
type POIType = 'amenity' | 'road' | 'attraction';

interface TourPOI {
  id: string;
  tour_id: string;
  label: string;
  description?: string;
  type: POIType;
  icon?: string;
  position: [number, number, number];
  created_at: string;
}

interface CreatePOIData {
  tour_id: string;
  label: string;
  description?: string;
  type: POIType;
  icon?: string;
  position_x: number;
  position_y: number;
  position_z: number;
}

interface UpdatePOIData {
  label?: string;
  description?: string;
  type?: POIType;
  icon?: string;
  position_x?: number;
  position_y?: number;
  position_z?: number;
}
```

### useTourAnalytics Hook
```typescript
interface UseTourAnalyticsReturn {
  track: (event: Omit<TourAnalyticsEvent, 'id' | 'created_at' | 'visitor_id'>) => void;
  flush: () => Promise<void>;
  visitorId: string;
}
```

### usePOIs Hook
```typescript
interface UsePOIsReturn {
  pois: TourPOI[];
  isLoading: boolean;
  createPOI: (data: CreatePOIData) => Promise<TourPOI>;
  updatePOI: (id: string, data: UpdatePOIData) => Promise<TourPOI>;
  deletePOI: (id: string) => Promise<void>;
}
```

### POI Overlay Props
```typescript
interface POIOverlayProps {
  pois: TourPOI[];
  onPOIClick: (poi: TourPOI) => void;
  radius?: number;
}

interface POIMarkerProps {
  poi: TourPOI;
  onClick: (poi: TourPOI) => void;
}

interface POIDetailPanelProps {
  poi: TourPOI | null;
  isOpen: boolean;
  onClose: () => void;
}
```

### POI Icon Config
```typescript
// src/config/poi-icons.ts
const POI_ICONS: Record<POIType, string> = {
  amenity: '🏢',  // or lucide icon name
  road: '🛣️',
  attraction: '🎯',
};
```

## Sequence Diagrams

### User Clicks Parcel → Event Tracked

```
User        ParcelLabel    useTourAnalytics    EventBuffer    Supabase
  │              │               │                 │              │
  │──click─────▶│               │                 │              │
  │              │──track()────▶│                 │              │
  │              │               │──push to[]────▶│              │
  │              │               │                 │              │
  │  (5s later OR 50 events)    │                 │              │
  │              │               │──flush()──────▶│              │
  │              │               │                 │──INSERT────▶│
  │              │               │                 │  batch rows  │
  │              │               │                 │              │
  │              │               │◀──success──────│              │
```

### Admin Views Analytics Dashboard

```
Admin       AdminDashboard    TourAnalyticsDashboard    useAnalyticsAggregates    Supabase
  │              │                    │                         │                   │
  │──click──────▶│                    │                         │                   │
  │  "Analytics" │──render───────────▶│                         │                   │
  │              │                    │──useAnalyticsAggregates▶│                   │
  │              │                    │                         │──RPC────────────▶│
  │              │                    │                         │  get_analytics_   │
  │              │                    │                         │  summary()        │
  │              │                    │                         │◀──aggregates─────│
  │              │                    │──render charts─────────▶│                   │
  │              │                    │──render DataTable──────▶│                   │
  │◀─dashboard───│                    │                         │                   │
```

### Admin Creates POI → Appears in Tour

```
Admin       TourManagementTab    usePOIs    Supabase    Buyer(Tour)
  │              │                  │           │            │
  │──click──────▶│                  │           │            │
  │  "Add POI"   │──form submit───▶│           │            │
  │              │                  │──INSERT──▶│            │
  │              │                  │  tour_pois│            │
  │              │                  │◀──created─│            │
  │              │──refetch list───▶│           │            │
  │              │                  │──SELECT──▶│            │
  │◀─list updated│                  │           │            │
  │              │                  │           │            │
  │  (next tour load)              │           │            │
  │              │                  │           │──usePOIs──▶│
  │              │                  │           │   SELECT   │
  │              │                  │           │──pois[]──▶│
  │              │                  │           │            │──POIOverlay renders
```

## Performance Strategy

### Event Batch Buffer

```typescript
// useTourAnalytics.ts — simplified
const BUFFER_SIZE = 50;
const FLUSH_INTERVAL_MS = 5000;

function useTourAnalytics(tourId: string) {
  const bufferRef = useRef<TourAnalyticsEvent[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visitorId = useMemo(() => getOrCreateVisitorId(), []);

  const flush = useCallback(async () => {
    if (bufferRef.current.length === 0) return;
    const events = [...bufferRef.current];
    bufferRef.current = [];
    await supabase.from('analytics_events').insert(events);
  }, []);

  const track = useCallback((event) => {
    bufferRef.current.push({ ...event, visitor_id: visitorId, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    if (bufferRef.current.length >= BUFFER_SIZE) flush();
  }, [visitorId, flush]);

  // Periodic flush
  useEffect(() => {
    timerRef.current = setInterval(flush, FLUSH_INTERVAL_MS);
    return () => { clearInterval(timerRef.current!); flush(); };
  }, [flush]);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => { navigator.sendBeacon?.(supabaseUrl, JSON.stringify(bufferRef.current)); };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return { track, flush, visitorId };
}
```

### Frustum Culling for POIs

POI markers use drei `<Html>` which already frustum-culls. Additionally, wrap all POI markers in a `<group frustumCulled>` (same pattern as `ParcelOverlay` line 93). For 50+ POIs, add distance-based culling: compute dot product of POI position with camera direction vector; skip rendering if behind camera.

### Dashboard Query Optimization

Use Supabase RPC for pre-aggregated analytics (avoids client-side grouping):

```sql
CREATE OR REPLACE FUNCTION get_analytics_summary(p_tour_id uuid, p_start timestamptz, p_end timestamptz)
RETURNS TABLE(parcel_id uuid, parcel_code text, total_clicks bigint, total_dwell_seconds numeric, whatsapp_actions bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.parcel_id,
    COALESCE(l.codigo, 'Unknown') AS parcel_code,
    COUNT(*) FILTER (WHERE ae.event_type = 'parcel_click') AS total_clicks,
    COALESCE(SUM(EXTRACT(EPOCH FROM (
      SELECT MAX(ae2.created_at) FROM analytics_events ae2
      WHERE ae2.event_type = 'dwell_end' AND ae2.parcel_id = ae.parcel_id AND ae2.created_at BETWEEN p_start AND p_end
    ) - (
      SELECT MIN(ae3.created_at) FROM analytics_events ae3
      WHERE ae3.event_type = 'dwell_start' AND ae3.parcel_id = ae.parcel_id AND ae3.created_at BETWEEN p_start AND p_end
    ))) / NULLIF(COUNT(*) FILTER (WHERE ae.event_type = 'dwell_start'), 0), 0) AS total_dwell_seconds,
    COUNT(*) FILTER (WHERE ae.event_type = 'whatsapp_action') AS whatsapp_actions
  FROM analytics_events ae
  LEFT JOIN lotes l ON l.id = ae.parcel_id
  WHERE ae.tour_id = p_tour_id AND ae.created_at BETWEEN p_start AND p_end
  GROUP BY ae.parcel_id, l.codigo
  ORDER BY total_clicks DESC;
$$;
```

Indexes: `(parcel_id, created_at)`, `(tour_id, created_at)`, `(event_type)` — already defined in spec.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useTourAnalytics` buffer logic | Mock `supabase.from().insert()`, push 49 events → verify no insert. Push 1 more → verify batch insert called with 50 events |
| Unit | `useTourAnalytics` flush on unmount | Mount → track events → unmount → verify flush called |
| Unit | `usePOIs` CRUD operations | Mock Supabase → verify create/update/delete calls and cache invalidation |
| Unit | `useAnalyticsAggregates` | Mock RPC → verify returned aggregates match expected shape |
| Integration | `POIOverlay` renders markers | Render with mock POIs → verify correct number of `<Html>` elements in R3F Canvas |
| Integration | `POIDetailPanel` opens on click | Render → click marker → verify panel visible with POI data |
| Integration | Event tracking end-to-end | Mount `VirtualTourViewer` → simulate parcel click → verify event in mock buffer |
| E2E | Admin creates POI, visible in tour | Playwright: admin → Tour tab → Add POI → fill form → Save → navigate to tour → verify marker visible |
| E2E | Analytics dashboard shows data | Playwright: admin → Analytics tab → verify chart renders with aggregated data |
| E2E | Date range filter | Playwright: select date range → verify table re-sorts and chart updates |

## Migration / Rollout

### Supabase Migration: `00030_analytics_events.sql`

```sql
-- analytics_events table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('parcel_click', 'dwell_start', 'dwell_end', 'whatsapp_action', 'tour_start', 'tour_end')),
  tour_id uuid REFERENCES public.tours_360(id) ON DELETE CASCADE,
  parcel_id uuid REFERENCES public.lotes(id) ON DELETE SET NULL,
  visitor_id text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_parcel_created ON public.analytics_events(parcel_id, created_at);
CREATE INDEX idx_analytics_events_tour_created ON public.analytics_events(tour_id, created_at);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_read_admin" ON public.analytics_events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin'));

CREATE POLICY "analytics_insert_anon" ON public.analytics_events
  FOR INSERT WITH CHECK (true);
```

### Supabase Migration: `00031_tour_pois.sql`

```sql
-- tour_pois table
CREATE TABLE public.tour_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours_360(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('amenity', 'road', 'attraction')),
  icon text,
  position_x float NOT NULL,
  position_y float NOT NULL,
  position_z float NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tour_pois_tour ON public.tour_pois(tour_id);
CREATE INDEX idx_tour_pois_type ON public.tour_pois(type);

ALTER TABLE public.tour_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "poi_read_all" ON public.tour_pois FOR SELECT USING (true);
CREATE POLICY "poi_write_admin" ON public.tour_pois FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
);
```

### Rollback Plan

1. Drop `analytics_events` and `tour_pois` tables (cascades remove all data)
2. Remove `useTourAnalytics`, `usePOIs`, `useAnalyticsAggregates` hooks
3. Remove `POIOverlay`, `POIMarker`, `POIDetailPanel`, `TourAnalyticsDashboard`, `TourManagementTab` components
4. Revert `VirtualTourViewer.tsx` and `VirtualTourCanvas.tsx` (remove POI props)
5. Revert `AdminDashboard.tsx` (remove Analytics/Tour tabs)
6. No impact on P0 tour functionality

## Open Questions

- [ ] Should analytics events include `session_id` for grouping multiple events from the same visitor session, or is `visitor_id` sufficient? Spec uses `visitor_id` which persists across sessions — consider if session-level grouping is needed for dashboard.
- [ ] For POI positioning: should admins input raw 3D coordinates (position_x/y/z) or should we provide a visual POI placer in the tour view? Current spec says form input, but visual placement is more intuitive.
- [ ] Should the `get_analytics_summary` RPC handle the fallback to legacy `property_clicks` data (REQ-AE-03 scenario 2), or should the client handle merging?
- [ ] The 5-second batch flush interval — should it be configurable per tour, or is a global constant acceptable?
