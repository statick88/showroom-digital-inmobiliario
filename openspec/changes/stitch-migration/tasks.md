# Tasks: Stitch Design Migration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~980 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (visual) → PR 2 (showroom) → PR 3 (admin) → PR 4 (auth+compliance) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Visual foundations + bugfixes | PR 1 (main) | Glass.css, shadow tokens, icon-map, marker styles, formatPrice fix, LPDP |
| 2 | Showroom layouts + detail | PR 2 (main) | Split layout, header, filters, markers, modal desktop, slide-right mobile, hero, gallery |
| 3 | Admin enhancements | PR 3 (main) | Donut, progress bar, ranking, editable table, search, leads table, mobile tabs |
| 4 | Auth + Compliance | PR 4 (main) | Login page, Supabase auth, middleware guard, cookie banner, LeadForm |

## Phase 1: Visual Foundations (PR 1) ✅

- [x] 1.1 Create `src/config/glass.css` with backdrop-blur utilities (light + dark)
- [x] 1.2 Update `DESIGN.md` shadow tokens to softer Stitch values
- [x] 1.3 Update `src/globals.css` shadow CSS variables + import glass.css in main.tsx
- [x] 1.4 Create `src/lib/icon-map.ts` with 28 Material→Lucide mappings
- [x] 1.5 Create `src/config/markers.ts` with marker config (16px, white border, status colors)
- [x] 1.6 Update `src/presentation/components/map/PropertyCard.tsx` hover+shadow+border styles

## Phase 2: Showroom Layouts (PR 2)

- [ ] 2.1 Refactor `MapView.tsx`: CSS Grid layout desktop (sidebar 380px + map), stack mobile
- [ ] 2.2 Add `HeaderNav` inside MapView with logo + Admin button (Lock icon)
- [ ] 2.3 Create `PropertyFilters.tsx`: Tipo, Estado, Distrito, Precio Min/Max, Moneda, Limpiar
- [ ] 2.4 Create marker layer in MapView (Leaflet circleMarkers, 16px, white border, status color)
- [ ] 2.5 Create `MarkerPopup.tsx`: thumbnail 80x80, title, price, district, badge, "Ver detalle"
- [ ] 2.6 Create `GlassControls.tsx`: zoom group, geolocation, Map/Satélite toggle
- [ ] 2.7 Refactor `PropertyDetailPanel.tsx`: mobile slide-right (framer-motion) + desktop modal (Radix Dialog)
- [ ] 2.8 Create `HeroImage.tsx`: 192px height, gradient overlay 60%, price+code+badge
- [ ] 2.9 Create `SpecsGrid.tsx`: 3-column grid with Ruler/Bed/Bath Lucide icons
- [ ] 2.10 Create `Gallery.tsx`: horizontal scroll thumbnails 112x80

## Phase 3: Admin Enhancements (PR 3)

- [ ] 3.1 Create `DonutChart.tsx` using recharts PieChart with --status-* colors
- [ ] 3.2 Create `ProgressBar.tsx` with gradient fill (cumplimiento de ventas)
- [ ] 3.3 Create `TopClickedTable.tsx`: ranked table (#, thumbnail, code, title, clicks)
- [ ] 3.4 Add inline status dropdown to PropertyTable (Disponible → Separado → Vendido)
- [ ] 3.5 Add confirm dialog on status change (CCI + payment method inputs)
- [ ] 3.6 Create `useStatusMutation.ts` hook (TanStack Query + Supabase PATCH)
- [ ] 3.7 Add search input + status filter to PropertyTable
- [ ] 3.8 Create `LeadsTable.tsx`: Nombre, Email, Teléfono, Propiedad, Fecha, "Ver"
- [ ] 3.9 Add user profile section to admin sidebar
- [ ] 3.10 Add mobile bottom tab bar (collapses sidebar on < 768px)

## Phase 4: Auth & Compliance (PR 4)

- [ ] 4.1 Create `LoginForm.tsx`: email + password + visibility toggle + "Ingresar"
- [ ] 4.2 Create `LoginPage.tsx`: centered card with brand logo + LoginForm
- [ ] 4.3 Create `src/lib/auth.ts`: Supabase Auth service + session helpers
- [ ] 4.4 Create `src/middleware.ts`: Next.js middleware for /admin route guard
- [ ] 4.5 Update `LeadForm.tsx`: add Turnstile Captcha + LPDP checkbox + phone +51 prefix
- [ ] 4.6 Add throttle logic to LeadForm (30s localStorage check)
- [ ] 4.7 Update lead insert mutation: consent_timestamp, consent_ip, user_agent
- [ ] 4.8 Create cookie banner component with localStorage persistence
- [ ] 4.9 Add root route redirect to showroom
- [ ] 4.10 Disable public registration (404 on /signup, /register)

## Phase 5: Testing (per PR)

- [ ] 5.1 Unit tests for icon-map.ts (28 mappings return correct Lucide icon)
- [ ] 5.2 Component tests for Desktop layout (grid, sidebar 380px)
- [ ] 5.3 Component tests for Mobile layout (stack, slide-right panel)
- [ ] 5.4 Component tests for PropertyFilters (filtering updates list)
- [ ] 5.5 Component tests for DonutChart (renders with data, empty state)
- [ ] 5.6 Component tests for LoginPage (valid/invalid states)
- [ ] 5.7 Integration test for status change (dropdown → confirm → mutation)
- [ ] 5.8 Component tests for LeadForm (validation, throttle, LPDP checkbox)
- [ ] 5.9 Run per PR: `pnpm lint && pnpm typecheck && pnpm test`
