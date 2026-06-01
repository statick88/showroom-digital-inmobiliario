# Design: Stitch Migration

## Architecture Decisions

### AD-01: Desktop Detail Modal
**Context**: DetailPanel en desktop usa fade overlay modal centrado (max-w-lg) inspirado en layout tradicional.
**Decision**: Implementar con Radix Dialog + framer-motion AnimatePresence para fade + scale.
**Rationale**: Radix Dialog provee accessibility (aria-modal, focus trap, esc to close) out of the box. framer-motion para la transición fade.
**Tradeoff**: No es slide-over como Stitch, pero Radix Dialog es más accesible y consistente.

### AD-02: Mobile Detail Panel
**Context**: DetailPanel en mobile debe abrirse como slide desde derecha (full overlay).
**Decision**: framer-motion AnimatePresence + motion.div slideX desde right, full-width (100vw) on mobile.
**Rationale**: Sin dependencias extra, framer-motion ya en proyecto. Slide desde derecha es un motion.div con `initial={{ x: '100%' }}` y `exit={{ x: '100%' }}`.
**Tradeoff**: Accesibilidad manual (aria-modal + focus trap) vs Radix Dialog.

### AD-03: Layout Strategy
**Context**: Desktop showroom cambia de stack vertical a split horizontal (sidebar + map).
**Decision**: CSS Grid `grid-cols-[380px_1fr]` para desktop, stack vertical para mobile.
**Rationale**: Sin JS layout, puro CSS, responsive sin estado de layout.
**Tradeoff**: Sidebar width fijo 380px — resize sería feature futuro.

### AD-04: Admin Editable Status
**Context**: Admin necesita cambiar estado de propiedad inline con dropdown.
**Decision**: Mutation via TanStack Query `useMutation` + Supabase `PATCH`.
**Rationale**: Infraestructura de queries ya existe; hook simple.
**Tradeoff**: Sin optimistic updates en v1 — refetch after mutation.

### AD-05: Auth Strategy
**Context**: Login + auth guard para ruta /admin.
**Decision**: Next.js App Router middleware + Supabase Auth (server-side session check).
**Rationale**: Supabase configurado; middleware redirect es nativo de Next.js.
**Tradeoff**: Sin refresh token rotation; usar supabase-js con auto-refresh.

## Component Tree (Post-Migration)

```
<App>
  <HeaderNav />                    {/* New: logo + Admin button */}
  <main>
    <MapView>
      ├── <PropertyFilters />           {/* New: tipo, estado, distrito, precio, moneda */}
      ├── <SidebarList>                 {/* New: 380px desktop */}
      │     └── <PropertyList>
      │           └── <PropertyCard />    {/* Modified: hover/shadow */}
      ├── <MapContainer>                {/* Existing: Leaflet */}
      │     ├── <Markers />             {/* New: circle 16px, color por estado */}
      │     ├── <MarkerPopup />         {/* New: thumb 80x80, title, price, district, badge */}
      │     └── <GlassControls />       {/* New: zoom, location, toggle */}
      └── <PropertyDetailPanel>         {/* Modified: modal desktop / slide-right mobile */}
            ├── <HeroImage />            {/* New: 192px height */}
            ├── <StatusBadge />          {/* New: top-left overlay */}
            ├── <SpecsGrid />            {/* New: 3 col, icons */}
            ├── <Gallery />              {/* New: horizontal scroll */}
            └── <LeadForm />             {/* Modified: LPDP checkbox */}
  </main>
</App>

<AdminLayout>                      {/* New: auth guard wrapper */}
  <AdminSidebar />                 {/* Modified: user profile */}
  <AdminDashboard>                 {/* Modified: charts + ranking */}
    ├── <MetricsPanel />
    ├── <DonutChart />             {/* New: recharts */}
    ├── <ProgressBar />            {/* New */}
    ├── <TopClickedTable />        {/* New */}
    ├── <PropertyTable>            {/* Modified: dropdown + search */}
    └── <LeadsTable />             {/* New */}
</AdminLayout>

<LoginPage>                        {/* New */}
  <LoginForm />
</LoginPage>
```

## Data Flow: Status Change

```
Admin Table → Status Dropdown (Disponible → Separado)
  → ConfirmDialog("¿Separar LT-042?")
    → Input CCI (opcional) + Payment Method
    → useMutation PATCH /api/properties/:id/status
      → Supabase: propiedades.update({ status, cci })
        → refetch propiedades query
          → UI updates (badge color, marker color)
```

## Responsive Breakpoints

| Breakpoint | Layout | DetailPanel | Admin |
|-----------|--------|-------------|-------|
| < 768px | Stack (map + list) | Slide from right (100vw) | Bottom tab bar |
| ≥ 768px | Split (sidebar + map) | Centered modal (max-w-lg) | Sidebar 192px |

## Icon Mapping

Ver `src/lib/icon-map.ts` — 26 Material Symbols → Lucide equivalents.

## File Changes Summary

| File | Action | LOC Est. |
|------|--------|----------|
| `src/config/glass.css` | New | 30 |
| `src/lib/auth.ts` | New | 50 |
| `src/lib/icon-map.ts` | New | 40 |
| `src/config/markers.ts` | New | 25 |
| `src/presentation/components/auth/LoginPage.tsx` | New | 70 |
| `src/presentation/components/auth/LoginForm.tsx` | New | 50 |
| `src/presentation/components/map/MapView.tsx` | Modified (major) | +80 |
| `src/presentation/components/map/PropertyCard.tsx` | Modified | +15 |
| `src/presentation/components/map/PropertyFilters.tsx` | New | 60 |
| `src/presentation/components/map/GlassControls.tsx` | New | 40 |
| `src/presentation/components/map/MarkerPopup.tsx` | New | 35 |
| `src/presentation/components/detail/PropertyDetailPanel.tsx` | Modified (major) | +60 |
| `src/presentation/components/detail/HeroImage.tsx` | New | 30 |
| `src/presentation/components/detail/Gallery.tsx` | New | 40 |
| `src/presentation/components/detail/SpecsGrid.tsx` | New | 30 |
| `src/presentation/components/leads/LeadForm.tsx` | Modified | +40 |
| `src/presentation/components/admin/AdminDashboard.tsx` | Modified (major) | +120 |
| `src/presentation/components/admin/DonutChart.tsx` | New | 40 |
| `src/presentation/components/admin/ProgressBar.tsx` | New | 30 |
| `src/presentation/components/admin/TopClickedTable.tsx` | New | 50 |
| `src/presentation/components/admin/LeadsTable.tsx` | New | 50 |
| `src/app/globals.css` | Modified | +15 |
| `src/middleware.ts` | New | 25 |
| **Total** | | **~980** |
