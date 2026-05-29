# Showroom Digital Inmobiliario — Design System

## Brand Overview

| Field | Value |
|-------|-------|
| **Product** | Showroom Digital Inmobiliario |
| **Type** | Peruvian PropTech platform for property browsing, lead generation, and sales tracking |
| **Register** | Product — app UI that serves the product |
| **Scene sentence** | *A buyer browsing properties on their phone after work, sitting on their couch in a dimly lit living room* → **dark mode default** |

## Color Strategy

**Type**: Committed — warm terracotta/adobe palette inspired by coastal Peru construction materials.

The palette evokes the warmth of adobe brick, terracotta roof tiles, and sand — materials intrinsic to Peruvian architecture. Status colors shift from cold primary greens/reds to warm-shifted tones that harmonize with the terracotta core.

### Primitive Color Palette (OKLCH)

All values in `oklch(L C H)` format. No grayscale values (all chroma > 0).

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--primary` | `0.55 0.18 35` | `0.62 0.14 35` | Brand terracotta, primary actions |
| `--primary-foreground` | `0.97 0.02 75` | `0.18 0.02 75` | Text on primary |
| `--accent` | `0.65 0.12 75` | `0.70 0.10 75` | Sand/gold, secondary highlight |
| `--accent-foreground` | `0.15 0.02 75` | `0.18 0.02 75` | Text on accent |
| `--background` | `0.97 0.02 75` | `0.18 0.02 75` | Warm off-white / warm charcoal |
| `--foreground` | `0.15 0.02 75` | `0.93 0.01 75` | Body text |
| `--card` | `0.99 0.01 75` | `0.22 0.02 75` | Card surface |
| `--card-foreground` | `0.15 0.02 75` | `0.93 0.01 75` | Card text |
| `--popover` | `0.99 0.01 75` | `0.22 0.02 75` | Popover surface |
| `--popover-foreground` | `0.15 0.02 75` | `0.93 0.01 75` | Popover text |
| `--secondary` | `0.94 0.01 75` | `0.25 0.02 75` | Secondary surface |
| `--secondary-foreground` | `0.15 0.02 75` | `0.93 0.01 75` | Text on secondary |
| `--muted` | `0.94 0.01 75` | `0.25 0.02 75` | Muted background |
| `--muted-foreground` | `0.50 0.02 75` | `0.65 0.02 75` | Muted text |
| `--border` | `0.88 0.01 75` | `0.30 0.01 75` | Borders, dividers |
| `--input` | `0.88 0.01 75` | `0.30 0.01 75` | Input borders |
| `--ring` | `0.55 0.18 35` | `0.62 0.14 35` | Focus rings (matches primary) |
| `--status-success` | `0.55 0.12 145` | `0.60 0.10 145` | Disponible — warm teal-green |
| `--status-warning` | `0.65 0.14 75` | `0.70 0.12 75` | Separado — warm amber |
| `--status-destructive` | `0.50 0.20 30` | `0.62 0.14 30` | Vendido — brick red |
| `--destructive` | `0.50 0.20 30` | `0.50 0.18 30` | Destructive action bg |
| `--destructive-foreground` | `0.97 0.02 75` | `0.93 0.01 75` | Text on destructive |

### Semantic → shadcn/ui CSS Variable Mapping

The primitive tokens above ARE the semantic mapping — each `--` variable maps directly to the shadcn/ui contract. The `@theme inline` block in `globals.css` maps the CSS vars to Tailwind utility classes:

| shadcn/ui var | Tailwind class | Maps to |
|---------------|---------------|---------|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Body text |
| `--card` | `bg-card` | Card surface |
| `--card-foreground` | `text-card-foreground` | Card text |
| `--popover` | `bg-popover` | Popover/dropdown surface |
| `--popover-foreground` | `text-popover-foreground` | Popover text |
| `--primary` | `bg-primary` | Primary buttons |
| `--primary-foreground` | `text-primary-foreground` | Primary button text |
| `--secondary` | `bg-secondary` | Secondary buttons |
| `--secondary-foreground` | `text-secondary-foreground` | Secondary button text |
| `--muted` | `bg-muted` | Muted backgrounds |
| `--muted-foreground` | `text-muted-foreground` | Low-emphasis text |
| `--accent` | `bg-accent` | Highlight surfaces |
| `--accent-foreground` | `text-accent-foreground` | Highlight text |
| `--destructive` | `bg-destructive` | Destructive/danger |
| `--border` | `border-border` | Borders |
| `--input` | `border-input` | Input borders |
| `--ring` | `ring-ring` | Focus rings |
| `--status-success` | `bg-status-success` / `text-status-success` | Disponible badge |
| `--status-warning` | `bg-status-warning` / `text-status-warning` | Separado badge |
| `--status-destructive` | `bg-status-destructive` / `text-status-destructive` | Vendido badge |

### Status Colors → Property State Mapping

| Estado | CSS Var | Role | Light Value | Dark Value |
|--------|---------|------|-------------|------------|
| `disponible` | `--status-success` | Available for purchase | `oklch(0.55 0.12 145)` | `oklch(0.60 0.10 145)` |
| `separado` | `--status-warning` | Reserved / hold | `oklch(0.65 0.14 75)` | `oklch(0.70 0.12 75)` |
| `vendido` | `--status-destructive` | Sold / closed | `oklch(0.50 0.20 30)` | `oklch(0.62 0.14 30)` |

### Chart Colors

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | `oklch(0.55 0.18 35)` | `oklch(0.62 0.14 35)` |
| `--chart-2` | `oklch(0.65 0.12 75)` | `oklch(0.70 0.10 75)` |
| `--chart-3` | `oklch(0.65 0.14 75)` | `oklch(0.70 0.12 75)` |
| `--chart-4` | `oklch(0.55 0.12 145)` | `oklch(0.60 0.10 145)` |
| `--chart-5` | `oklch(0.50 0.20 30)` | `oklch(0.62 0.14 30)` |

## Typography

### Font Stack

| Use | Font | Fallback |
|-----|------|----------|
| UI / Body | **Inter** | `ui-sans-serif, system-ui, sans-serif` |
| Code | **JetBrains Mono** | `ui-monospace, monospace` |
| Headings | **Inter** (same as body, different weights) | — |

### Heading Scale

| Level | Size | Line-height | Weight | Letter-spacing |
|-------|------|-------------|--------|---------------|
| h1 | 24px | 1.3 | 700 (Bold) | -0.01em |
| h2 | 20px | 1.35 | 600 (Semibold) | -0.01em |
| h3 | 18px | 1.4 | 600 (Semibold) | 0 |
| h4 | 16px | 1.4 | 600 (Semibold) | 0 |
| h5 | 14px | 1.4 | 500 (Medium) | 0 |
| h6 | 13px | 1.4 | 500 (Medium) | +0.01em |

### Body Scale

| Size | Font-size | Line-height | Use |
|------|-----------|-------------|-----|
| sm | 14px | 1.5 | Labels, meta |
| base | 16px | 1.5 | Paragraphs, body |
| lg | 18px | 1.6 | Lead text, large body |

### Token Aliases

```
--font-sans: Inter
--font-mono: JetBrains Mono
--font-heading: Inter
```

## Spacing (4/8dp Scale)

All spacing values are multiples of 4px for visual rhythm consistency.

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

## Elevation

Shadows use warm-tinted rgba values (terracotta/adobe undertones) instead of neutral black for a softer, cohesive feel.

| Layer | `box-shadow` | Use |
|-------|-------------|-----|
| **Card** | `0px 4px 20px rgba(160, 152, 144, 0.08)` | Property cards, metric cards, default |
| **Card Hover** | `0px 8px 30px rgba(160, 152, 144, 0.12)` | Interactive cards on hover |
| **Modal** | `0px 8px 40px rgba(160, 152, 144, 0.15)` | Dialogs, detail panels, slide-over |
| **Popover** | `0px 12px 48px rgba(160, 152, 144, 0.18)` | Dropdowns, menus, floating panels |
| **Tooltip** | `0px 16px 56px rgba(160, 152, 144, 0.2)` | Tooltips, floating labels |
| **Glass** | `0px 4px 12px rgba(160, 152, 144, 0.1)` | Glass buttons, glass overlays |

## Icon System

### Icon Library

**Lucide React** (`lucide-react`) — exclusively. No emoji as structural icons.

### Size Tokens

| Token | Size | Use |
|-------|------|-----|
| `--icon-sm` | 16px | Inline with text, small badges |
| `--icon-md` | 20px | Property card fallback, list items |
| `--icon-lg` | 24px | Metric panel icons, hero areas |

### Semantic Status Icons

| Status | Icon | Color Token |
|--------|------|-------------|
| Disponible | `<CheckCircle2 />` | `text-status-success` |
| Separado | `<Clock />` | `text-status-warning` |
| Vendido | `<XCircle />` | `text-status-destructive` |

### Accessibility Rule

All standalone icons MUST include either:
- `aria-label` (interactive icons)
- `aria-hidden="true"` (decorative icons accompanying visible text)

## Dark Mode

Dark mode is the **default** (per scene sentence). The `.dark` class block provides the dark palette values. The `:root` block provides the light palette for when users switch to light mode.

| Token | :root (light) | .dark |
|-------|---------------|-------|
| `--background` | `oklch(0.97 0.02 75)` | `oklch(0.18 0.02 75)` |
| `--foreground` | `oklch(0.15 0.02 75)` | `oklch(0.93 0.01 75)` |
| `--primary` | `oklch(0.55 0.18 35)` | `oklch(0.62 0.14 35)` |
| ... | (see full palette tables above) | |

## WCAG 2.1 AA Compliance Notes

- All text-on-background pairs target ≥ 4.5:1 contrast ratio (normal text)
- Large text (≥ 18px bold or ≥ 24px regular) passes at ≥ 3:1
- All interactive states (focus rings) use the primary terracotta color with sufficient contrast against adjacent surfaces
- Status badges (`bg-status-*`) use white/dark text depending on the lightness of the status color
- Contrast verification is automated via `src/testing/contrast.test.ts` for all semantic pairs in both modes

## Border Radius

| Token | Value |
|-------|-------|
| `--radius` | `0.625rem` (10px) |
| `--radius-sm` | `calc(var(--radius) * 0.6)` |
| `--radius-md` | `calc(var(--radius) * 0.8)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) * 1.4)` |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` |
