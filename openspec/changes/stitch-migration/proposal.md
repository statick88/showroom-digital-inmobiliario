# Proposal: Stitch Design Migration

## Intent

Migrar los layouts, componentes y sistema visual desde los designs generados por Google Stitch (Andean Modernity) hacia la implementación actual del Showroom. La migración cubre 6 capacidades que transforman la experiencia de comprador y asesor, alineando el producto con el diseño premium aprobado en Stitch.

## Scope

### In Scope
- Showroom desktop split layout (sidebar 380px + map + header nav)
- Showroom mobile bottom sheet con drag-to-close
- DetailPanel slide-over (desktop right panel, mobile bottom sheet)
- Admin Dashboard: donut chart, progress bar, top clicked ranking
- Admin tabla propiedades editable: inline status dropdown + search
- Login page + auth guard para ruta /admin
- LPDP consent checkbox en LeadForm + cookie banner
- Visual polish: glass controls, shadow system, icon mapping Material→Lucide

### Out of Scope
- Realtime subscriptions para cambios de estado (HU futura)
- Click tracking instrumentation (HU futura)
- Gráfico donut SVG nativo (usar recharts, ya en plan)
- Migración a Google Fonts (Plus Jakarta Sans / Hanken Grotesk) — se mantiene Inter
- Master plan overlay (SVG arquitectónico) — deferred

## Capabilities

### New Capabilities
- `showroom-layout`: Desktop split sidebar+map + mobile bottom sheet + header nav
- `property-detail`: Slide-over (desktop) + bottom sheet drag (mobile) + hero image
- `auth-login`: Login page + auth guard middleware + session management
- `lpdp-compliance`: Privacy consent checkbox + cookie banner + política link
- `click-tracking`: UI instrumentation for property clicks and detail views

### Modified Capabilities
- `visual-system`: Updated shadow tokens, glassmorphism utilities, icon equivalents
- `admin-enhanced`: Charts, top-clicked ranking, editable status dropdown, search

## Approach

Migración por capas: (1) design tokens + utilities → (2) layouts → (3) components → (4) admin → (5) auth → (6) compliance. Cada fase produce PR independiente.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/presentation/components/map/MapView.tsx` | Modified | Split layout desktop, header nav, glass controls |
| `src/presentation/components/map/PropertyCard.tsx` | Modified | Hover border, shadow, responsive |
| `src/presentation/components/detail/PropertyDetailPanel.tsx` | Modified | Slide-over desktop, bottom sheet mobile, hero |
| `src/presentation/components/admin/AdminDashboard.tsx` | Modified | Charts, ranking, search |
| `src/presentation/components/leads/LeadForm.tsx` | Modified | LPDP checkbox, phone prefix |
| `src/presentation/components/auth/LoginPage.tsx` | New | Login screen |
| `src/config/glass.css` | New | Glassmorphism utilities |
| `src/lib/auth.ts` | New | Auth service + middleware |
| `DESIGN.md` | Modified | Shadow tokens updated |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Bottom sheet library no soporta drag-to-close | Med | Usar vaul (geist) o implementar con framer-motion |
| Slide-over rompe responsive existente | Med | Feature flag, probar en 3 viewports antes de merge |
| Admin editable status necesita mutation Supabase | Med | Ya existe API de estados, solo agregar mutation hook |
| LPDP checkbox bloquea envío si no acepta | Low | Estado local, submit deshabilitado hasta aceptar |

## Rollback Plan

Por PR: git revert del merge commit. Si es feature branch chain, revertir el merge a main del tracker branch.

## Dependencies

- `vaul` o `@radix-ui/react-dialog` para bottom sheet + slide-over
- `recharts` para donut chart (ya en plan REQ-07)

## Success Criteria

- [ ] Desktop: sidebar 380px + mapa fill, header con Admin button
- [ ] Mobile: bottom sheet con drag para lista y detail
- [ ] DetailPanel: slide desktop, bottom sheet mobile, hero 280px
- [ ] Admin: donut chart + progress bar + top clicked ranking
- [ ] Admin: dropdown inline cambia estado con confirmación
- [ ] Login: página + auth guard redirect
- [ ] LPDP: checkbox bloquea submit + cookie banner visible
