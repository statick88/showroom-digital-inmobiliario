# Visual Polish Specification

## Purpose

Actualizar el sistema visual: glassmorphism utilities, sombras, icon mapping Material→Lucide, formatos numéricos Perú, marker styles.

## MODIFIED Requirements

### REQ-VS-01: Glassmorphism Utilities (from visual-system)

The system SHALL provide CSS utility classes for glass-style surfaces using backdrop-filter blur and semi-transparent backgrounds.

(Previously: No glassmorphism utilities existed)

#### Scenario: Glass card renders with blur

- GIVEN a glass utility class is applied
- THEN the element MUST have `backdrop-filter: blur(12px)`
- AND a semi-transparent background (light: rgba(255,255,255,0.8), dark: rgba(24,24,27,0.8))
- AND a subtle border (1px solid rgba(228,220,211,0.3))

### REQ-VS-02: Shadow System Update (from visual-system)

The system SHALL update elevation tokens to include softer, warmer shadows matching the Stitch design.

(Previously: Standard Tailwind shadows)

#### Scenario: Cards use updated shadows

- GIVEN a card component renders
- THEN it MUST use the new shadow: `0px 4px 20px rgba(160,152,144,0.08)`
- AND hover states MAY use: `0px 8px 30px rgba(160,152,144,0.12)`

### REQ-VS-03: Icon Equivalents (from icon-system)

The system SHALL provide a mapping table of Material Symbols (from Stitch) to Lucide React icons.

(Previously: Lucide icons only, no Material→Lucide mapping)

#### Scenario: Icon map returns correct Lucide component

- GIVEN a Material symbol name (e.g., "location_on")
- WHEN `iconMap.get("location_on")` is called
- THEN it MUST return the `<MapPin />` Lucide icon
- AND ALL 26 Stitch icons MUST have equivalents

| Material | Lucide | Size |
|----------|--------|------|
| lock | Lock | sm |
| location_on | MapPin | md |
| square_foot | Ruler | md |
| bed | Bed | md |
| bathtub | Bath | md |
| chat_bubble | MessageCircle | md |
| dashboard | LayoutDashboard | md |
| domain | Building2 | md |
| trending_up | TrendingUp | md |
| search | Search | sm |
| filter_list | Filter | sm |
| edit | Pencil | sm |
| check_circle | CheckCircle2 | sm |
| chevron_left | ChevronLeft | sm |
| chevron_right | ChevronRight | sm |
| calendar_today | Calendar | md |
| login | LogIn | md |
| visibility | Eye | md |
| visibility_off | EyeOff | md |
| my_location | Crosshair | md |
| layers | Layers | md |
| add | Plus | sm |
| remove | Minus | sm |
| pool | Waves | md |
| local_parking | Car | md |
| security | Shield | md |
| verified_user | ShieldCheck | md |
| arrow_back | ArrowLeft | sm |
| logout | LogOut | sm |

## ADDED Requirements

### REQ-VS-04: PropertyCard Hover

PropertyCard MUST use border-primary on hover with a smooth shadow transition.

#### Scenario: Card highlights on hover

- GIVEN the user hovers over a PropertyCard
- THEN the card border MUST transition to --primary color
- AND the shadow MUST elevate smoothly (from shadow-sm to shadow-md)
- AND the transition MUST be 150ms ease-out

### REQ-VS-05: Peruvian Number Format

All monetary amounts MUST use `Intl.NumberFormat('es-PE')` with 0 decimal places and the appropriate currency symbol (S/ or $) based on the property's `moneda` field.

#### Scenario: Price formats correctly

- GIVEN a property has moneda = "PEN" and precio = 450000
- WHEN the price is displayed
- THEN it MUST render as "S/ 450,000" (using es-PE locale)
- AND moneda = "USD" with precio = 120000 MUST render as "$ 120,000"

### REQ-VS-06: Phone Format

Phone inputs MUST display "+51" as the default country code prefix for Peru.

#### Scenario: Phone input shows +51

- GIVEN a phone input field renders
- THEN it MUST show "+51" as a pre-filled prefix
- AND the remaining digits input MUST accept up to 9 digits
- AND the full format should be "+51 999 999 999"

### REQ-VS-07: Marker Circle Style

Map markers MUST be rendered as circles (16px diameter, 2px white border) with colors matching property status.

#### Scenario: Marker follows status color

- GIVEN a property with status "disponible"
- WHEN its marker renders
- THEN the marker MUST be a 16px circle with 2px white border
- AND the fill color MUST be --status-success (green)
- AND status "separado" MUST use --status-warning (amber)
- AND status "vendido" MUST use --status-destructive (red)
