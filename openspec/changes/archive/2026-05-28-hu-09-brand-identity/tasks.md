# Tasks: HU-09 — Brand Identity & Design System

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200-350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Brand tokens + status consolidation + icons | PR 1 | Single PR — cosmetic, no logic changes |

## Phase 1: Foundation — Token Infrastructure

- [x] 1.1 RED: Write `src/testing/contrast.test.ts` — WCAG 2.1 AA verification for all semantic pairs (light + dark modes) using OKLCH→relative luminance calc
- [x] 1.2 GREEN: Create `DESIGN.md` — palette (OKLCH), typography (Inter/JetBrains Mono), spacing (4/8dp), elevation shadows, icon tokens (`icon-sm/md/lg`), light/dark mappings
- [x] 1.3 GREEN: Update `src/globals.css` — replace 15 grayscale `oklch(... 0 0)` vars → brand palette; add `--status-*` and `--icon-*` tokens in `:root` + `.dark`
- [x] 1.4 REFACTOR: Run `npx vitest run` — contrast test passes

## Phase 2: Core — Status Color Consolidation

- [x] 2.1 GREEN: `MapView.tsx` — swap `COLORS` hex values to `var(--status-*)` refs
- [x] 2.2 GREEN: `PropertyCard.tsx` — replace `bg-emerald/amber/red-500` with `bg-status-*`
- [x] 2.3 GREEN: `PropertyDetailPanel.tsx` — replace `bg-emerald/amber/red-500` with `bg-status-*`
- [x] 2.4 GREEN: `MetricasPanel.tsx` — replace `text-emerald/amber/red-600` with `text-status-*`

## Phase 3: Polish — Icon Replacements

- [x] 3.1 RED: Write test — `PropertyCard` renders `<Building />` (no 🏗️) in image fallback state
- [x] 3.2 GREEN: `PropertyCard.tsx` — replace 🏗️→`<Building size={20} className="text-zinc-400" aria-label="Sin imagen" />`; import from `lucide-react`
- [x] 3.3 RED: Write test — `PropertyDetailPanel` renders `<Building />` (no 🏗️) in fallback area
- [x] 3.4 GREEN: `PropertyDetailPanel.tsx` — replace 🏗️→`<Building size={40} className="text-zinc-700" aria-label="Sin imagen" />`; import from `lucide-react`

## Phase 4: Verification

- [x] 4.1 Run `npx vitest run` — all tests pass (85 tests, 3 suites)
- [x] 4.2 Run `npx tsc --noEmit` — zero type errors
- [x] 4.3 Grep audit: `src/` has zero 🏗️ emoji in JSX (only test string literals)
- [x] 4.4 Verify shadcn/ui components render correctly with brand tokens
