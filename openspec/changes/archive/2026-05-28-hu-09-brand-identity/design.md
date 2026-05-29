# Design: HU-09 Brand Identity & Design System

## Technical Approach

Three-layer token architecture (primitive → semantic → component) powered by OKLCH. A warm terracotta/adobe brand palette replaces 100% grayscale. Status colors consolidate from 4 inline locations into CSS vars. 🏗️ emoji replaced with Lucide `Building` icon.

```
DESIGN.md (source of truth)
    │
    ├── globals.css — @theme inline + :root/.dark CSS vars
    │       │
    │       ├── shadcn/ui components (consume --primary, --accent, etc.)
    │       ├── Status tokens (--status-success, --status-warning, etc.)
    │       └── Icon tokens (--icon-sm/md/lg)
    │
    └── .tsx components — inline hex/TW classes → CSS var references
```

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| **Warm palette** vs cool/neutral | Warm = 30-60% surface = trust for Peruvian PropTech; risk: too bold | **Warm committed**: terracotta primary, sand secondary, toasty neutral bg |
| **OKLCH** vs HSL/hex | OKLCH = perceptual uniformity, Tailwind v4 native; OKLCH chroma calc less widespread | **OKLCH** — already the project standard |
| **CSS vars in :root** vs Tailwind `@theme` | `@theme` = Tailwind intellisense; `:root` = JS runtime access | **Both**: `@theme inline` for Tailwind, `:root` for shadcn/ui contract |
| **Inline → CSS var** for status colors | CSS var = single source of truth; refactor means touching 4 files | **CSS vars** — `--success`/`--warning`/`--destructive` in `:root` + `.dark` |
| **Building icon size** for fallback | 20px matches text-xl equivalent; 16px too small, 24px too heavy | **20px (icon-md)** per icon-system spec |

## Palette Strategy

| Role | Light OKLCH | Dark OKLCH | Rationale |
|------|-------------|------------|-----------|
| Primary (terracotta) | `0.55 0.18 35` | `0.62 0.14 35` | Adobe/terracotta of coastal Peru |
| Accent (sand/gold) | `0.65 0.12 75` | `0.70 0.10 75` | Warm complement to terracotta |
| Background | `0.97 0.02 75` | `0.18 0.02 75` | Warm off-white / deep warm charcoal |
| Success (disponible) | `0.55 0.12 145` | `0.60 0.10 145` | Warm-shifted teal-green |
| Warning (separado) | `0.65 0.14 75` | `0.70 0.12 75` | Warm amber (already harmonious) |
| Destructive (vendido) | `0.50 0.20 30` | `0.58 0.18 30` | Brick-red (terracotta family) |

## Status Color Migration

Current inline locations → consolidated into CSS variables:

| Location | Current | Target |
|----------|---------|--------|
| `MapView.tsx:19` — `COLORS` record | `"#22c55e"`, `"#eab308"`, `"#ef4444"` | `var(--status-success)`, `var(--status-warning)`, `var(--status-destructive)` |
| `PropertyCard.tsx:3` — `ESTADO_STYLES` | `bg-emerald-500`, `bg-amber-500`, `bg-red-500` | `bg-status-success`, `bg-status-warning`, `bg-status-destructive` |
| `PropertyDetailPanel.tsx:6` — `ESTADO_CONFIG` | Same as above | Same CSS var mapping |
| `MetricasPanel.tsx:35` — `cards[].color` | `text-emerald-600`, `text-amber-600`, `text-red-600` | `text-status-success`, `text-status-warning`, `text-status-destructive` |

The `ESTADO_STYLES`/`ESTADO_CONFIG`/`COLORS`/`cards` records remain in code for DX but reference CSS vars via Tailwind classes.

## Icon Replacement

| File | Line | Before | After |
|------|------|--------|-------|
| `PropertyCard.tsx` | 46-48 | `<span>🏗️</span>` | `<Building size={20} className="text-zinc-400" aria-label="Sin imagen" />` |
| `PropertyDetailPanel.tsx` | 52-54 | `<span>🏗️</span>` | `<Building size={40} className="text-zinc-700" aria-label="Sin imagen" />` |

- Import `Building` from `lucide-react`
- Sizes: PropertyCard=20px (md), PropertyDetailPanel=40px (consistent with hero area scale)
- `aria-label` for accessibility per icon-system R6

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `DESIGN.md` | Create | Full brand token system: colors, typography, spacing, elevation, icons, dark mode |
| `src/globals.css` | Modify | Replace 15 grayscale OKLCH → brand palette; add `--status-*` and `--icon-*` vars |
| `src/presentation/components/map/PropertyCard.tsx` | Modify | 🏗️ → `<Building />`; ESTADO_STYLES → Tailwind CSS var classes |
| `src/presentation/components/map/PropertyDetailPanel.tsx` | Modify | 🏗️ → `<Building />`; ESTADO_CONFIG → Tailwind CSS var classes |
| `src/presentation/components/map/MetricasPanel.tsx` | Modify | Inline `text-emerald-600` etc → `text-status-*` CSS var classes |
| `src/presentation/components/map/MapView.tsx` | Modify | `COLORS` record hex → `var(--status-*)` string refs |
| `src/testing/contrast.test.ts` | Create | Vitest utility verifying WCAG 2.1 AA for all semantic pairs |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | WCAG contrast compliance | `contrast.test.ts` — programmatic OKLCH→relative luminance calc for all 20+ semantic pairs in light+dark |
| Integration | shadcn/ui renders with brand tokens | `<Button>Hola</Button>` renders with non-grayscale primary bg |
| Visual | No 🏗️ in codebase | `grep` audit of `.tsx` files |
| Build | TypeScript + build pass | `npx tsc --noEmit && npx vitest run && npx next build` |

## Migration / Rollout

**No migration required.** All changes are cosmetic (CSS + icon swap). Rollback: `git revert` globals.css + 4 component files; delete DESIGN.md.

## Open Questions

- None. Design is fully specified.
