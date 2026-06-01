# Archive Report — stitch-migration

**Archived**: 2026-05-31
**Archive path**: `openspec/changes/archive/2026-05-31-stitch-migration/`
**Verification status**: PASS_WITH_NOTES

---

## 1. Summary

The Stitch Design Migration transformed the Showroom Digital Inmobiliario platform from a basic layout to the premium Stitch (Andean Modernity) design system. The migration was executed in 5 phases across ~980 LOC, covering visual foundations, showroom layouts, admin enhancements, auth & compliance, and comprehensive testing.

## 2. Phases Completed

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Visual foundations: glass.css, icon-map, markers, shadow tokens, card hover | ✅ Complete |
| **Phase 2** | Showroom Layouts: MapView CSS Grid split, HeaderNav, PropertyFilters, CircleMarkers, MarkerPopup, GlassControls, PropertyDetailPanel, HeroImage, SpecsGrid, Gallery | ✅ Complete |
| **Phase 3** | Admin Enhancements: DonutChart, ProgressBar, TopClickedTable, inline status dropdown, useStatusMutation, search/filter, LeadsTable, user profile, mobile tab bar | ✅ Complete |
| **Phase 4** | Auth & Compliance: auth.ts service, LoginPage, middleware guard, LeadForm (Turnstile + LPDP + throttle), CookieBanner, consent audit trail, root redirect | ✅ Complete |
| **Phase 5** | Testing: 152 unit tests across all components + post-verify fixes for TopClickedTable thumbnail, privacy link, Más información link, GlassControls zoom wiring, MapView route wiring | ✅ Complete |

## 3. Specs Synced to Main

| Domain | Action | Details |
|--------|--------|---------|
| `design-tokens` | Updated | R4 (Elevation) updated with Stitch shadow values; R4-A (Glassmorphism Utilities) added; R4-B (Peruvian Number Format) added |
| `icon-system` | Updated | R8-A (Material-to-Lucide Mapping) added with 28 icon mappings |
| `showroom-layout` | Created | 7 requirements from delta + REQ-SL-08 (PropertyCard Hover) |
| `property-detail` | Created | 7 requirements (modal desktop, slide mobile, hero, status badge, specs, gallery, CTA) |
| `admin-enhanced` | Created | 8 requirements (donut chart, progress bar, top clicked, editable status, search, profile, leads, mobile tabs) |
| `auth-login` | Created | 5 requirements (login page, auth guard, session, root redirect, no registration) |
| `lead-form` | Created | 6 requirements (modal trigger, form fields, Turnstile, LPDP, throttle, submit) |
| `lpdp-compliance` | Created | 3 requirements (privacy consent, cookie banner, consent audit trail) |

## 4. Files Changed

### New Files Created
| File | Description |
|------|-------------|
| `src/config/glass.css` | Glassmorphism CSS utility classes (backdrop-blur, semi-transparent backgrounds) |
| `src/lib/auth.ts` | Supabase Auth service + session helpers |
| `src/lib/icon-map.ts` | 28 Material Symbol → Lucide React icon mappings |
| `src/config/markers.ts` | Circle marker config (16px, white border, status colors) |
| `src/middleware.ts` | Next.js middleware for /admin route guard |
| `src/presentation/components/auth/LoginPage.tsx` | Login page with email/password form |
| `src/presentation/components/auth/LoginForm.tsx` | Login form with validation |
| `src/presentation/components/map/PropertyFilters.tsx` | Filter bar (Tipo, Estado, Distrito, Precio, Moneda) |
| `src/presentation/components/map/GlassControls.tsx` | Glass-styled zoom, geolocation, layer toggle |
| `src/presentation/components/map/MarkerPopup.tsx` | Marker popup with thumb, title, price, badge |
| `src/presentation/components/detail/HeroImage.tsx` | 192px hero with gradient overlay |
| `src/presentation/components/detail/Gallery.tsx` | Horizontal scroll thumbnail gallery |
| `src/presentation/components/detail/SpecsGrid.tsx` | 3-column specs grid with Lucide icons |
| `src/presentation/components/admin/DonutChart.tsx` | Recharts donut chart with status colors |
| `src/presentation/components/admin/ProgressBar.tsx` | Gradient progress bar |
| `src/presentation/components/admin/TopClickedTable.tsx` | Ranked top 5 clicked table |
| `src/presentation/components/admin/LeadsTable.tsx` | Leads table with detail view |

### Modified Files
| File | Description |
|------|-------------|
| `src/presentation/components/map/MapView.tsx` | CSS Grid split layout + header nav + markers + glass controls |
| `src/presentation/components/map/PropertyCard.tsx` | Hover border, shadow, responsive |
| `src/presentation/components/detail/PropertyDetailPanel.tsx` | Desktop modal (Radix Dialog) + mobile slide (framer-motion) |
| `src/presentation/components/admin/AdminDashboard.tsx` | Charts, ranking, search, editable table |
| `src/presentation/components/leads/LeadForm.tsx` | Turnstile + LPDP checkbox + phone +51 prefix + throttle |
| `src/app/globals.css` | Shadow CSS variables + glass.css import |

## 5. Test Results

- **Total tests**: 152/152 PASS
- **Test suite**: `npx vitest run` — all passing
- **Coverage**: Meets project threshold (≥80%)
- **Linting**: `npx next lint` — passing
- **Type check**: `npx tsc --noEmit` — passing
- **Build**: `npx next build` — passing

Areas tested:
- icon-map.ts (28 mappings return correct Lucide icon)
- Desktop layout (CSS Grid split, sidebar 380px)
- Mobile layout (stack, slide-right panel)
- PropertyFilters (filtering updates list)
- DonutChart (renders with data, empty state)
- LoginPage (valid/invalid states)
- Status change (dropdown → confirm → mutation)
- LeadForm (validation, throttle, LPDP checkbox)
- All component rendering and interaction tests

## 6. Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Pre-existing Playwright e2e config conflict | Low | Not related to this change. The existing e2e configuration references test files that were migrated during the Vite migration. Will be resolved in a separate change. |

## 7. Verification Status

**PASS_WITH_NOTES**

All 5 phases complete. All 152 tests pass. Existing specs updated, new specs promoted to main. Known issues are pre-existing and unrelated to this change.

## 8. Rollback Recovery

If rollback is needed:
1. Git revert of the feature branch merge commits (PR 1-4)
2. Archive folder `2026-05-31-stitch-migration` contains all original delta specs
3. Main specs have been merged — to revert, restore from git history
