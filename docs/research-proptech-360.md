# Research: Proptech 360° Virtual Tour Innovations for Showroom Digital Inmobiliario

**Date:** June 2026
**Scope:** LATAM real estate virtual tour landscape, feature gap analysis, innovation opportunities
**Reference platforms:** Latitud360.cl (Masterplan 360), @amarpreciado (real estate visual marketing)

---

## 1. Market Analysis: 360° Virtual Tours in LATAM Real Estate (2026)

### 1.1 Key Statistics

| Metric | Value | Source |
|--------|-------|--------|
| Virtual tour market global projection | USD $8B+ by 2033 | DataInsightsMarket 2026 |
| Properties with 3D tours sell faster | Up to 31% faster | Matterport 143,575-listing study |
| Price premium with 3D tours | 4–9% higher prices | Matterport / R2U |
| Buyer engagement with tours | 87% more views, 95% more phone inquiries | Matterport |
| Buyers who won't consider without tour | 54% | RemarkVisions 2025 |
| Lead quality improvement | 49% more qualified leads | Matterport |
| Masterplan 360 conversion uplift | +55% vs traditional plans | Latitud360.cl |
| Dwell time increase with Masterplan | +25–35% | Latitud360.cl |
| Bounce rate reduction with tours | 10–20% drop | Virtually Anywhere |

### 1.2 LATAM Competitive Landscape

**Chile** — Latitud360.cl, Virtualplan360.cl, Recorridos360.cl, GrupoMarketing.cl
- Focus: Parcelaciones/loteos (land subdivision projects)
- Business model: Per-project pricing, 7-day delivery from capture
- Key feature: Aerial 360° masterplan with parcel overlays, status badges, and POI markers

**Brazil** — R2U, Getafeel, QuintoAndar, Loft
- R2U: Interactive masterplans + Apple Vision Pro + AR staging, browser-first
- Getafeel: 3D digital twins + CRM integration for pre-construction
- QuintoAndar: Consolidated portals (Urbania.pe, Adondevivir.pe)

**Colombia** — LaHaus (USD $163M raised), Habi (unicornio)
- Focus: Marketplace + CRM + lead scoring

**Peru** — GoJom (YC), Proper, Propeler, InmoDigital
- Market: USD $1,100M portals, 82% mobile traffic, 6.1M users searching online
- Gap: No MLS mature system, no interactive masterplan product exists
- Opportunity: First-mover in interactive masterplan 360 for Peru

### 1.3 Technology Trends Shaping 2026

1. **Browser-first, no-download** — R2U proved that app-based tours break the WhatsApp share-link flow. URL-based tours convert 5–10x better for follow-up.
2. **Real-time inventory sync** — Live unit status (available/sold/reserved) synced from CRM or sales spreadsheet.
3. **AI Virtual Staging** — Zillow acquired VirtualStagingAI. Empty rooms → furnished in seconds via AI. 3DVista and iStaging offer this in-tour.
4. **AR/VR integration** — Apple Vision Pro for luxury pre-construction, WebAR for no-app AR on phones.
5. **Sun path + view simulation** — R2U includes sunlight by time-of-day and real views per floor/unit.
6. **Analytics layer** — Dwell time per unit, finishing selections, gesture data, channel attribution.
7. **8K 360° cameras** — Insta360 X6 (April 2026) enables 8K@60p for walkthroughs at $579.

---

## 2. Feature Gap Analysis: Our Showroom vs Latitud360.cl

### 2.1 What Latitud360.cl Offers (and We Don't)

| Feature | Latitud360.cl | Our Showroom | Gap |
|---------|---------------|--------------|-----|
| **Aerial 360° masterplan** | Drone-captured equirectangular from above, showing entire project | None | CRITICAL |
| **Interactive parcel overlay** | SVG/canvas overlay showing lot boundaries, numbers, status | Basic `MapaLotes.tsx` with static data | MAJOR |
| **Real-time parcel status** | Available/Sold/Reserved badges on each parcel, admin-manageable 24/7 | `FiltrosLotes.tsx` filters but no live status | MAJOR |
| **Pricing per parcel** | Price displayed on hover/tap of each parcel | Not shown in tour view | MAJOR |
| **Points of Interest markers** | Embedded hotspots showing nearby amenities, roads, attractions | None | MAJOR |
| **First-person ground views** | Low-altitude 360° captures per parcel for realistic on-ground experience | `VirtualTourViewer.tsx` equirectangular only | MODERATE |
| **Admin self-service platform** | Client portal to update sale status and pricing 24/7 without developer | Admin CRUD panel exists but not tour-integrated | MODERATE |
| **Shareable link (no app required)** | URL-based, works on all devices, WhatsApp-ready | PWA offline support exists | LOW (already good) |
| **AI-generated lifestyle videos** | Instagram/TikTok content showing "life in your parcel" via AI | None | MODERATE |
| **CRM/sales integration** | Auto-administration for sales team | Basic lead capture + WhatsApp | MINOR |

### 2.2 What Our Showroom Has That Latitud360 Doesn't

| Feature | Our Showroom | Latitud360 |
|---------|--------------|------------|
| Lead capture + WhatsApp integration | ✅ Deep integration | ❌ Basic contact form |
| PWA offline support | ✅ Full offline | ❌ No offline |
| Admin CRUD (full panel) | ✅ Properties, images, users | ⚠️ Limited self-service |
| React + Three.js custom stack | ✅ Full control | ⚠️ Proprietary platform |
| Supabase backend | ✅ PostgreSQL + Auth + RLS | ❌ Unknown |
| Property detail pages with images | ✅ Hero images, catalogs | ⚠️ Tour-focused |

---

## 3. Innovation Opportunities: NEW Features to Differentiate

### 3.1 Interactive Masterplan Layer (HIGH IMPACT)

**Concept:** Overlay interactive SVG/Canvas parcel boundaries on the 360° aerial panorama, enabling buyers to click/tap parcels to see details.

**UI/UX Pattern:**
```
┌─────────────────────────────────────────────┐
│           360° AERIAL VIEW                  │
│  ┌─────┐                                    │
│  │ L-01│ ← Parcel badge (color-coded)       │
│  │ S/85K│   Green=available, Red=sold        │
│  └─────┘   Yellow=reserved                  │
│         ┌─────┐                             │
│         │ L-02│                             │
│         │ S/92K│                            │
│         └─────┘                             │
│  📍 Parque Industrial    🏫 Colegio San José │
│  (POI marker)            (POI marker)       │
└─────────────────────────────────────────────┘
```

**Technical Approach:**
- Use R3F `<Html>` component to project SVG overlays onto the 360° sphere
- Parcel polygons stored as GeoJSON in Supabase `parcels` table
- Real-time status via Supabase Realtime subscriptions
- Click handler opens a modal with FichaTecnicaLote + WhatsApp CTA

### 3.2 Sun Path & View Simulation (DIFFERENTIATOR)

**Concept:** Show buyers how sunlight hits their parcel at different times of day and what views they'd have from each elevation.

**Technical Approach:**
- Three.js directional light animated by time-of-day slider
- Pre-rendered view panoramas per floor/elevation
- Shader-based shadow mapping on terrain
- Data: latitude/longitude → solar position calculations

### 3.3 AI Virtual Staging Integration (2026 TREND)

**Concept:** For apartment units, let buyers toggle between empty and staged views using AI-generated furniture.

**Technical Approach:**
- API call to VirtualStagingAI or similar service
- Before/after slider UI component
- Store staged images in Supabase Storage
- Per-unit customization: buyer selects finishes (floor, countertop, fixtures)

### 3.4 Analytics Dashboard (LEAD QUALIFICATION)

**Concept:** Track buyer behavior inside the tour to qualify leads for the sales team.

**Metrics to capture:**
- Dwell time per parcel/unit
- Number of revisits
- Finishing selections tested
- Share/WhatsApp actions
- Channel attribution (in-gallery vs WhatsApp vs direct)

**Technical Approach:**
- Event tracking in R3F components → Supabase `analytics_events` table
- Dashboard in admin panel showing top parcels, hottest leads
- Integration with existing lead capture system

### 3.5 WhatsApp Share with Deep Link (DISTRIBUTION)

**Concept:** Generate unique shareable URLs per parcel that deep-link into the tour at the exact viewing position.

**Technical Approach:**
- URL hash parameters: `#parcel=L-01&lat=X&lng=Y&zoom=Z`
- WhatsApp pre-filled message with parcel details + link
- Open Graph meta tags for rich preview in WhatsApp/social

### 3.6 First-Person Ground Level Views (IMMERSION)

**Concept:** Transition from aerial 360° to ground-level 360° at each parcel, giving buyers a realistic "standing on the lot" experience.

**Technical Approach:**
- Two-layer tour: aerial sphere + ground spheres
- Hotspot on each parcel triggers transition to ground view
- Smooth camera animation between elevation levels
- Multiple ground captures per parcel (front, center, back)

---

## 4. Implementation Priority Matrix

### P0 — Must Have (Sprint 1–2, 2–4 weeks)

| Feature | Impact | Effort | Rationale |
|---------|--------|--------|-----------|
| **Interactive parcel overlay on 360° view** | 🔴 Critical | Medium | Core differentiator vs Latitud360. Direct conversion impact (+55%). Uses existing R3F + Supabase stack. |
| **Real-time parcel status badges** | 🔴 Critical | Low | Extend existing Supabase `parcels` table with status field. Add Realtime subscription. |
| **WhatsApp deep link per parcel** | 🔴 Critical | Low | URL hash params + pre-filled WhatsApp message. Direct lead capture improvement. |

### P1 — Should Have (Sprint 3–4, 4–6 weeks)

| Feature | Impact | Effort | Rationale |
|---------|--------|--------|-----------|
| **Pricing overlay per parcel** | 🟡 High | Low | Add `price` field to parcel data, render in overlay. Admin can update 24/7. |
| **Points of Interest markers** | 🟡 High | Medium | POI data table + hotspot rendering in R3F. Enhances project context. |
| **Analytics dashboard** | 🟡 High | Medium | Event tracking + Supabase queries + admin dashboard. Lead qualification tool. |
| **Admin self-service for tour data** | 🟡 High | Medium | Extend existing admin CRUD to manage tour-specific data (status, pricing, POIs). |

### P2 — Nice to Have (Sprint 5–8, 8–12 weeks)

| Feature | Impact | Effort | Rationale |
|---------|--------|--------|-----------|
| **First-person ground-level views** | 🟠 Medium | High | Requires additional 360° capture at ground level. Major UX upgrade. |
| **AI virtual staging** | 🟠 Medium | High | Third-party API integration. Apartment-focused, less critical for parcelas. |
| **Sun path simulation** | 🟢 Low-Medium | High | Complex shader work. Differentiator but niche appeal. |
| **AR on-site experience** | 🟢 Low-Medium | Very High | WebAR/Apple Vision Pro. Long-term R&D, not MVP. |

---

## 5. Technical Feasibility with Existing Stack

### 5.1 Stack Assessment

| Component | Current | Required for New Features | Feasible? |
|-----------|---------|--------------------------|-----------|
| **React + Three.js (R3F)** | ✅ Already in use | Add `<Html>` overlay, hotspots, camera animations | ✅ YES |
| **Supabase (PostgreSQL)** | ✅ Already in use | Add parcels table fields, analytics_events table, Realtime | ✅ YES |
| **Supabase Auth + RLS** | ✅ Already in use | Multi-tenant parcel management | ✅ YES |
| **Supabase Storage** | ✅ Already in use | Store additional 360° captures, staged images | ✅ YES |
| **PWA** | ✅ Already in use | No changes needed | ✅ YES |
| **WhatsApp integration** | ✅ Already in use | Add deep link generation | ✅ YES |
| **Admin CRUD panel** | ✅ Already in use | Extend for tour data management | ✅ YES |

### 5.2 Recommended Implementation Path

**Phase 1 — Interactive Masterplan (P0, 2–4 weeks)**
1. Add `status`, `price`, `area`, `description` fields to parcels table
2. Create GeoJSON polygon data for each parcel boundary
3. Build `InteractiveParcelOverlay.tsx` — SVG/Canvas overlay projected onto 360° sphere
4. Add Supabase Realtime subscription for live status updates
5. Create `ParcelDetailModal.tsx` with FichaTecnicaLote + WhatsApp CTA
6. Add URL hash routing for deep links (`#parcel=L-01`)

**Phase 2 — Analytics + Admin (P1, 4–6 weeks)**
1. Create `analytics_events` table (event_type, parcel_id, user_id, duration, timestamp)
2. Add event tracking to R3F interaction handlers
3. Build analytics dashboard in admin panel
4. Extend admin CRUD to manage parcel tour data

**Phase 3 — Immersion (P2, 8–12 weeks)**
1. Capture ground-level 360° panoramas per parcel (or generate from aerial)
2. Build transition system between aerial ↔ ground views
3. Research AI virtual staging API integration
4. Prototype sun path simulation with Three.js lights

### 5.3 Libraries to Evaluate

| Library | Purpose | npm | Size |
|---------|---------|-----|------|
| `@react-three/drei` | R3F utilities (Html, Billboard, Text) | ✅ Already available | — |
| `@react-three/postprocessing` | Visual effects for transitions | `npm i @react-three/postprocessing` | ~50KB |
| `react-map-gl` + `maplibre-gl` | Map overlay for parcel context | `npm i react-map-gl maplibre-gl` | ~200KB |
| `@supabase/supabase-js` | Realtime subscriptions | ✅ Already available | — |
| `three-spritetext` | 3D text labels in R3F | `npm i three-spritetext` | ~5KB |

---

## 6. Market Opportunity Summary

### Why This Matters for Peru

1. **No interactive masterplan product exists in Peru.** Latitud360 operates in Chile. Peru has 24,713 homes sold in Lima alone (2025), +19% YoY. First-mover advantage is real.

2. **82% mobile traffic.** Our PWA + browser-first approach aligns perfectly with the Peruvian market. No app download required = WhatsApp share-link flow works.

3. **USD $1,100M portal market with no MLS.** The fragmented market creates opportunity for a platform that combines tour + lead capture + sales analytics.

4. **Conversion data is compelling.** Latitud360 reports +55% conversion and +25–35% dwell time. Matterport confirms 31% faster sales and 4–9% price premium.

5. **Our tech stack is production-ready.** React + R3F + Supabase is exactly what R2U uses (WebGL in browser). We don't need to rebuild — we need to extend.

### Competitive Moat

- **Custom-built** vs Latitud360's proprietary platform → full control over features and pricing
- **Supabase backend** → real-time inventory sync that Latitud360 charges extra for
- **PWA offline** → unique in LATAM market, critical for areas with poor connectivity
- **Lead capture + WhatsApp** → deep funnel integration that SaaS platforms lack
- **Admin CRUD** → self-service for developers without paying per-update fees

---

## Sources

- Latitud360.cl — Masterplan 360 product pages and blog
- R2U — "Interactive Masterplan Real Estate: 2026 Developer Guide"
- Matterport — "Virtual Tours and Real Estate Sales" (143,575-listing study)
- PropTech Scoop — "PropTech 2026: Technologies Transforming Property Development"
- DataInsightsMarket — Virtual Tour 2026-2034 Analysis
- RemarkVisions — Virtual Tour Best Practices for Luxury Real Estate 2025
- Virtualplan360.cl — Masterplan 360 product features
- Getafeel — 3D digital twin solutions for residential developers
- INFORME_TENDENCIAS_PROPTECH_PERU_2026.md — Internal market research
- investigacion-proptech-showroom-digital.md — Internal stack research
