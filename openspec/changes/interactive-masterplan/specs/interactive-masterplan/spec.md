# Interactive Masterplan Overlay Specification

## Purpose

R3F-based parcel overlay inside the 360° equirectangular Canvas. Renders GeoJSON polygon boundaries projected onto a sphere, with status badges, pricing labels, click-to-detail panels, and WhatsApp deep links. Reuses existing `FichaTecnicaLote`, `useWhatsApp`, `useRealtimeLotes`, and `polygon-styles.ts`.

## ADDED Requirements

### REQ-IM-01: Interactive Parcel Overlay

The system MUST render parcel boundary polygons as 3D line geometries inside the R3F `<Canvas>` of the 360° virtual tour viewer. Polygons MUST be projected from GeoJSON lat/lng coordinates onto a sphere of radius 499 (inside the 500-radius texture sphere) relative to `panoramaCenter`.

#### Scenario: Parcel boundaries render on sphere

- GIVEN a tour with 3 valid parcels and a valid `panoramaCenter`
- WHEN the 360° viewer loads the scene
- THEN parcel boundary lines MUST render inside the Canvas at radius 499
- AND boundaries MUST align with the visual terrain in the panorama
- AND lines MUST use colors from `polygon-styles.ts` mapped by parcel status

#### Scenario: Parcels rotate with camera

- GIVEN parcels are rendered in the Canvas
- WHEN the user drags to rotate the camera
- THEN parcel meshes MUST rotate naturally with the scene
- AND no DOM-to-camera sync jitter MUST occur
- AND parcels MUST remain visually anchored to their geographic position

#### Scenario: No panoramaCenter degrades gracefully

- GIVEN a tour scene with `panoramaCenter` undefined
- WHEN the viewer loads
- THEN NO parcel overlays MUST render
- AND a console warning MUST log missing panoramaCenter
- AND the tour MUST still function (pan, zoom, scene nav)

### REQ-IM-02: Real-time Parcel Status Badges

Each rendered parcel MUST display an `<Html>` badge (via drei) showing the parcel code, status color, and a status label. Badges MUST update in real-time when parcel status changes via Supabase Realtime.

#### Scenario: Badge shows correct status colors

- GIVEN parcels with statuses: disponible, separado, vendido
- WHEN the viewer renders
- THEN each badge MUST show green for disponible, amber for separado, red for vendido
- AND the badge text MUST show the parcel code (e.g., "L-01")
- AND badges MUST use `<Html distanceFactor={10}>` for size-distance scaling

#### Scenario: Real-time status update reflected

- GIVEN parcel L-01 has status "disponible" (green badge visible)
- WHEN an admin changes L-01 status to "vendido" in Supabase
- THEN within 2 seconds the badge MUST change to red
- AND the status label MUST update to "Vendido"
- AND the boundary line color MUST update to match

#### Scenario: Badge hit area on mobile

- GIVEN the viewer is on a mobile device (viewport < 768px)
- WHEN parcel badges render
- THEN each badge MUST have a minimum touch target of 44×44px
- AND tapping the badge MUST open the detail panel

### REQ-IM-03: Pricing Display

Each parcel badge MUST display the formatted price below the status label. Price MUST be formatted as SO/ PEN with thousands separator (e.g., "S/ 125,000").

#### Scenario: Price renders correctly

- GIVEN parcel L-01 has precio_venta = 125000
- WHEN the badge renders
- THEN the price MUST display as "S/ 125,000"
- AND price MUST use monospace or consistent width font for alignment

#### Scenario: Parcel without price

- GIVEN parcel L-02 has precio_venta = null
- WHEN the badge renders
- THEN the price line MUST show "Consultar"
- AND the badge MUST still show status and code

### REQ-IM-04: WhatsApp Deep Links

Clicking a parcel badge or detail panel CTA MUST open a WhatsApp deep link with a pre-filled message containing: parcel code, area (m²), price, and a tour deep link (`?tour={tourId}#parcel={code}`).

#### Scenario: WhatsApp link opens with correct message

- GIVEN parcel L-01 (area: 150m², price: S/ 125,000) in tour "tour-abc"
- WHEN the user taps "WhatsApp" in the detail panel
- THEN a WhatsApp URL MUST open with pre-filled text
- AND the text MUST contain "L-01"
- AND the text MUST contain "150 m²"
- AND the text MUST contain "S/ 125,000"
- AND the text MUST contain the tour deep link

#### Scenario: WhatsApp fallback on desktop

- GIVEN the user is on desktop (no WhatsApp app)
- WHEN the user clicks the WhatsApp CTA
- THEN `web.whatsapp.com` MUST open with the same pre-filled message
- AND the link MUST use `https://wa.me/?text=...` format

### REQ-IM-05: Panorama Center Data Model

The system MUST store `center_lat_lng` as a JSONB field (`{lat: number, lng: number}`) in each element of the `tours_360.escenas` array. A Supabase migration MUST add this field and backfill existing Ayacucho tour scenes with coordinates `{-13.163, -74.224}`.

#### Scenario: Migration adds center_lat_lng

- GIVEN migration `000XX_add_panorama_center.sql` runs
- WHEN query `SELECT escenas FROM tours_360 WHERE id = 'ayacucho-tour'`
- THEN each escena element MUST have `center_lat_lng` JSONB field
- AND the field MUST contain `lat` and `lng` as numbers

#### Scenario: Backfilled coordinates for existing tours

- GIVEN the Ayacucho tour exists before migration
- WHEN migration completes
- THEN all escena elements MUST have `center_lat_lng` = `{"lat": -13.163, "lng": -74.224}`
- AND new tours MUST also require this field (validation at write time)

### REQ-IM-06: Parcel Detail Panel

Clicking a parcel badge MUST open a detail panel. On desktop (≥768px): slide-over from right. On mobile (<768px): bottom-sheet. The panel MUST reuse `FichaTecnicaLote` for parcel details and `useWhatsApp` for the CTA.

#### Scenario: Desktop panel opens

- GIVEN a desktop viewport (≥768px)
- WHEN the user clicks parcel L-01 badge
- THEN a slide-over panel MUST open from the right
- AND it MUST display `FichaTecnicaLote` with L-01 data
- AND a "WhatsApp" CTA button MUST be visible at the bottom
- AND clicking the backdrop MUST close the panel

#### Scenario: Mobile panel opens

- GIVEN a mobile viewport (<768px)
- WHEN the user taps parcel L-01 badge
- THEN a bottom-sheet MUST slide up from the bottom
- AND it MUST occupy the lower 60% of the viewport
- AND it MUST display `FichaTecnicaLote` with L-01 data
- AND swiping down MUST dismiss the panel

#### Scenario: Panel shows correct parcel data

- GIVEN parcel L-01 has: area=150m², precio=125000, status=disponible
- WHEN the detail panel opens for L-01
- THEN the panel MUST show "L-01" as title
- AND area MUST display as "150 m²"
- AND price MUST display as "S/ 125,000"
- AND status MUST show green "Disponible" badge

### REQ-IM-07: Performance Budget

The parcel overlay MUST maintain 60fps on mid-range mobile devices with up to 50 parcels. The system SHOULD use `InstancedMesh` for same-status parcels and frustum-cull labels beyond the camera view.

#### Scenario: 50 parcels render at 60fps

- GIVEN a tour with 50 parcels
- WHEN the user rotates the camera on a mid-range mobile device
- THEN frame rate MUST stay ≥ 55fps
- AND no visible jank or frame drops during rotation
- AND parcel labels MUST cull when behind the camera

#### Scenario: 100+ parcels degrade gracefully

- GIVEN a tour with 100+ parcels
- WHEN the overlay loads
- THEN parcels MUST still render correctly
- AND labels SHOULD use `<Billboard>` fallback for low-end devices
- AND a performance warning SHOULD log if frame rate drops below 45fps

## Data Contracts

### Supabase Schema Change

```sql
-- Migration: 000XX_add_panorama_center.sql
ALTER TABLE tours_360
  ADD COLUMN escenas JSONB DEFAULT '[]';

-- Each escena element gains:
-- { "id": "...", "nombre": "...", "panorama_url": "...",
--   "center_lat_lng": { "lat": -13.163, "lng": -74.224 } }
```

### Component Props

```typescript
interface ParcelOverlayProps {
  parcels: Lote[];
  panoramaCenter: { lat: number; lng: number };
  onParcelClick: (lote: Lote) => void;
}

interface ParcelPolygonMeshProps {
  geojson: GeoJSON.Polygon;
  panoramaCenter: { lat: number; lng: number };
  status: 'disponible' | 'separado' | 'vendido';
  radius?: number; // default 499
}

interface ParcelLabelProps {
  lote: Lote;
  position: [number, number, number];
  onClick: (lote: Lote) => void;
}

interface ParcelDetailPanelProps {
  lote: Lote | null;
  isOpen: boolean;
  onClose: () => void;
}
```

### Real-time Contract

```typescript
// useRealtimeLotes returns:
interface RealtimeLoteEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Lote | null;
  old: Lote | null;
}
// Subscription filter: proyecto_id = tour.proyectoId
```

## REMOVED Requirements

None — this is a new capability.

## RENAMED Requirements

None — this is a new capability.
