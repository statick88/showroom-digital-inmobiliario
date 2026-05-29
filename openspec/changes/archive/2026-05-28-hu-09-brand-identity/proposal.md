# Proposal: HU-09 — Brand Identity & Design System

## Intent

App has zero brand identity — 100% grayscale OKLCH (chroma 0), no `DESIGN.md`, 🏗️ emoji as image fallback. For a Peruvian PropTech platform this erodes trust. Establish a complete design token system and brand identity.

## Scope

**In**: `DESIGN.md` with full tokens (colors, typography, spacing, elevation, semantic, light+dark). Brand positioning for Peruvian market. Replace 🏗️→Lucide Building. Migrate `globals.css` to brand tokens. WCAG 2.1 AA.

**Out**: Component refactors, animations, search/pagination, layout redesign — all deferred.

## Capabilities

### New
- `design-tokens`: Brand palette, typography scale, spacing, elevation, semantic colors, light/dark mappings
- `icon-system`: SVG icon usage rules, emoji-replacement standards using Lucide

### Modified
- None (no existing specs in `openspec/specs/`)

## Approach

1. Research Peruvian PropTech competitors → warm "committed" brand color (terracotta/adobe-inspired)
2. Author `DESIGN.md` with OKLCH tokens following shadcn/ui convention
3. Map shadcn/ui CSS vars → brand palette in `globals.css`
4. Replace 🏗️→`<Building />` from `lucide-react` (already installed)
5. Semantic status tokens (disponible=green, separado=amber, vendido=red) aligned to brand
6. Light: warm neutrals + accent. Dark: deeper warm tones, adjusted contrast

## Affected Areas

| Area | Impact | Detail |
|------|--------|--------|
| `DESIGN.md` | New | Token source of truth |
| `src/globals.css` | Modified | Grayscale → brand tokens |
| `src/.../PropertyCard.tsx` | Modified | 🏗️→ Building icon |
| `src/.../PropertyDetailPanel.tsx` | Modified | 🏗️→ Building icon |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Color misses market context | Med | Research competitors first |
| Missed inline color classes | Low | Audit all `.tsx` before merge |

## Rollback

`git revert` globals.css + components; delete `DESIGN.md`. Cosmetic only — no data risk.

## Dependencies

- `lucide-react` Building icon (already in `package.json`)

## Success Criteria

- [ ] `DESIGN.md` published with complete token spec
- [ ] `globals.css` uses only brand tokens — zero grayscale OKLCH
- [ ] WCAG 2.1 AA in light + dark modes verified
- [ ] No 🏗️ emoji in codebase
- [ ] shadcn/ui components render correctly with new tokens
- [ ] `npx vitest run` passes
- [ ] `npx next build` passes with zero type errors
