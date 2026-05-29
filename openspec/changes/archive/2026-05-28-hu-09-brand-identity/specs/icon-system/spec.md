# Icon System Specification

## Purpose

Define rules and standards for SVG icon usage across Showroom Digital Inmobiliario — eliminating emoji-as-icon patterns, standardizing on Lucide React, and ensuring accessible, consistent iconography throughout the UI.

## Requirements

### R1: No Emoji as Structural Icons

No emoji SHALL be used as a structural icon or visual placeholder in any UI component. Emoji are permitted only in user-generated content or free-text copy.

#### Scenario: Codebase audit finds zero emoji-icons
- GIVEN a `grep -rn "emoji-pattern" src/` regex audit (targeting emoji used as JSX children in non-text contexts)
- WHEN searching for structural emoji usage in `.tsx` files
- THEN zero matches SHALL be found
- AND the 🏗️ emoji SHALL NOT appear in any render path

### R2: Lucide React for All Icons

All icons MUST use components from `lucide-react`. No other icon library SHALL be installed.

#### Scenario: No other icon library listed in dependencies
- GIVEN `package.json`
- WHEN checking `dependencies`
- THEN only `lucide-react` MUST be listed as an icon library

### R3: Replace 🏗️ in PropertyCard

The 🏗️ emoji in `PropertyCard.tsx` MUST be replaced with `<Building />` from `lucide-react`.

#### Scenario: PropertyCard renders Building icon
- GIVEN `PropertyCard.tsx` renders the image fallback
- WHEN a property has no images
- THEN the component MUST render `<Building />` instead of `🏗️`
- AND `npx vitest run` MUST PASS

### R4: Replace 🏗️ in PropertyDetailPanel

The 🏗️ emoji in `PropertyDetailPanel.tsx` MUST be replaced with `<Building />` from `lucide-react`.

#### Scenario: PropertyDetailPanel renders Building icon
- GIVEN `PropertyDetailPanel.tsx` renders the image fallback area
- WHEN a property has no images
- THEN the component MUST render `<Building />` instead of `🏗️`
- AND `npx vitest run` MUST PASS

### R5: Icon Size Tokens

Icon sizes MUST use consistent design tokens: `icon-sm` (16px), `icon-md` (20px), `icon-lg` (24px). These MUST be documented in `DESIGN.md`.

#### Scenario: Icon size tokens are documented
- GIVEN `DESIGN.md`
- WHEN reading the icon tokens section
- THEN `icon-sm: 16px`, `icon-md: 20px`, and `icon-lg: 24px` MUST be defined

#### Scenario: Icons use token sizes
- GIVEN any `.tsx` file rendering a Lucide icon
- WHEN inspecting the `size` prop
- THEN it MUST use one of the token sizes (16, 20, or 24)
- AND icons in different contexts MUST consistently map to the same token size

### R6: Accessible Icon Labels

Every standalone icon (non-decorative) MUST have either an `aria-label` attribute or an adjacent `sr-only` `<span>` providing a textual description for screen readers.

#### Scenario: Icon with aria-label
- GIVEN a Lucide icon used as a standalone interactive element
- WHEN rendering the icon
- THEN the element MUST include `aria-label="{descriptive text}"`
- OR have a sibling `<span className="sr-only">{text}</span>`

#### Scenario: Decorative icons are hidden from AT
- GIVEN a Lucide icon used purely decoratively (accompanying visible text)
- WHEN rendering the icon
- THEN it MUST include `aria-hidden="true"`

### R7: Consistent Icon Stroke Width

All Lucide icons MUST use a consistent stroke width: the Lucide default (1.5px) or explicitly `strokeWidth={2}`. Mixed stroke widths SHALL NOT appear within the same component.

#### Scenario: Icons share stroke width
- GIVEN any Lucide icon rendered in the app
- WHEN checking the `strokeWidth` prop
- THEN all icons MUST use the same value (either omitting for default 1.5 or explicitly `2`)

### R8: Semantic Status Icons

Property status indicators (disponible, separado, vendido) SHOULD use semantic Lucide icons with status-appropriate colors mapped to brand tokens.

#### Scenario: Status icons use semantic mapping
- GIVEN `StatusBadge` or equivalent component
- WHEN rendering `disponible`
- THEN it SHOULD render `<CheckCircle2 />` with success color token
- WHEN rendering `separado`
- THEN it SHOULD render `<Clock />` with warning color token
- WHEN rendering `vendido`
- THEN it SHOULD render `<XCircle />` with destructive color token
