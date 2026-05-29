# Design Tokens Specification

## Purpose

Define the complete brand token system — palette, typography, spacing, elevation, and semantic mappings — for consistent theming across light and dark modes with WCAG 2.1 AA compliance.

## Requirements

### R1: Brand Color Palette in DESIGN.md

`DESIGN.md` MUST document the brand palette as OKLCH values: **primary** (terracotta/adobe for Peruvian PropTech), **accent**, and **supporting** (success, warning, error, info). Each MUST list light and dark variants. No grayscale OKLCH with chroma 0 SHALL appear.

#### Scenario: Palette avoids chroma-0 OKLCH
- GIVEN the DESIGN.md color palette
- WHEN examining every brand color
- THEN none SHALL contain `oklch(... 0 0)` — chroma MUST be > 0

### R2: Typography Scale in DESIGN.md

`DESIGN.md` MUST document a typography scale: **Inter** for UI/body, **JetBrains Mono** for code. Headings (h1–h6) MUST specify font-size, line-height, weight, and letter-spacing. Body MUST include sm, base, lg sizes.

#### Scenario: Heading and body tokens exist
- GIVEN the DESIGN.md typography section
- WHEN inspecting heading and body tokens
- THEN h1–h6 MUST define size + line-height + weight + letter-spacing
- AND body MUST include sm, base, lg

### R3: Spacing Scale (4/8dp)

Spacing tokens MUST follow the 4/8dp grid: 4, 8, 12, 16, 24, 32, 48, 64 px — all multiples of 4.

#### Scenario: Spacing values are multiples of 4
- GIVEN the DESIGN.md spacing section
- WHEN inspecting every spacing token
- THEN each value MUST be divisible by 4

### R4: Elevation Shadow System

`DESIGN.md` MUST define distinct `box-shadow` values for **card**, **modal**, **popover**, and **tooltip**.

#### Scenario: Each elevation has a unique shadow
- GIVEN the DESIGN.md elevation section
- WHEN checking shadow tokens
- THEN card, modal, popover, and tooltip MUST each have unique `box-shadow`

### R5: Semantic Tokens → shadcn/ui CSS Vars

Brand colors MUST map to all shadcn/ui CSS custom properties in both light and dark modes: `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--border`, `--ring`, `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--input`.

#### Scenario: All shadcn/ui vars are mapped in DESIGN.md
- GIVEN the DESIGN.md semantic mapping
- WHEN checking required CSS variables
- THEN every shadcn/ui variable listed above MUST have light AND dark OKLCH values

### R6: globals.css — Zero Grayscale OKLCH

`globals.css` MUST replace all `oklch(... 0 0)` values with brand colors from DESIGN.md. Zero grayscale OKLCH in `:root` or `.dark`.

#### Scenario: No chroma-0 values in :root
- GIVEN `src/globals.css`
- WHEN reading the `:root` block
- THEN no custom property SHALL have `oklch(... 0 0)`
- (Previously: 15 of 19 vars used chroma 0)

#### Scenario: No chroma-0 values in .dark
- GIVEN `src/globals.css`
- WHEN reading the `.dark` block
- THEN no custom property SHALL have `oklch(... 0 0)`

### R7: shadcn/ui Render Correctly

Existing shadcn/ui components MUST render without visual regressions after token migration.

#### Scenario: Button renders with brand background
- GIVEN a test rendering `<Button>Hola</Button>`
- WHEN checking computed `background-color`
- THEN it MUST resolve to a non-grayscale OKLCH matching brand primary
- AND `npx vitest run` MUST PASS

### R8: WCAG 2.1 AA Contrast

All text-on-background color pairs MUST meet 4.5:1 contrast (normal text) / 3:1 (large text) in BOTH modes.

#### Scenario: Foreground on background ≥ 4.5:1 in light mode
- GIVEN a contrast verification utility
- WHEN measuring `--foreground` on `--background` in `:root`
- THEN contrast MUST be ≥ 4.5:1

#### Scenario: Foreground on background ≥ 4.5:1 in dark mode
- GIVEN a contrast verification utility
- WHEN measuring `--foreground` on `--background` in `.dark`
- THEN contrast MUST be ≥ 4.5:1

### R9: Contrast Verification Utility

A Vitest utility MUST verify WCAG 2.1 AA compliance for all semantic pairs in both modes programmatically.

#### Scenario: Vitest verifies all contrast pairs
- GIVEN `contrast.test.ts`
- WHEN running `npx vitest run`
- THEN every semantic pair (foreground/background, primary/primary-foreground, etc.) in both modes MUST be tested
- AND all MUST PASS with ratio ≥ 4.5:1
