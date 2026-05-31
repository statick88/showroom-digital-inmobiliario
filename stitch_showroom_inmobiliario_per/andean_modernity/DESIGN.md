---
name: Andean Modernity
colors:
  surface: "#fff8f3"
  surface-dim: "#e2d8cf"
  surface-bright: "#fff8f3"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#fcf2e9"
  surface-container: "#f6ece3"
  surface-container-high: "#f0e6dd"
  surface-container-highest: "#ebe1d8"
  on-surface: "#1f1b15"
  on-surface-variant: "#55423e"
  inverse-surface: "#35302a"
  inverse-on-surface: "#f9efe6"
  outline: "#89726d"
  outline-variant: "#dcc1ba"
  surface-tint: "#9b432e"
  primary: "#98412c"
  on-primary: "#ffffff"
  primary-container: "#b85941"
  on-primary-container: "#fffbff"
  inverse-primary: "#ffb4a2"
  secondary: "#86513b"
  on-secondary: "#ffffff"
  secondary-container: "#ffb99f"
  on-secondary-container: "#7a4732"
  tertiary: "#00685d"
  on-tertiary: "#ffffff"
  tertiary-container: "#008376"
  on-tertiary-container: "#f4fffb"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdad2"
  primary-fixed-dim: "#ffb4a2"
  on-primary-fixed: "#3c0700"
  on-primary-fixed-variant: "#7d2d19"
  secondary-fixed: "#ffdbce"
  secondary-fixed-dim: "#fcb69c"
  on-secondary-fixed: "#351002"
  on-secondary-fixed-variant: "#6a3a26"
  tertiary-fixed: "#8af5e4"
  tertiary-fixed-dim: "#6dd8c8"
  on-tertiary-fixed: "#00201c"
  on-tertiary-fixed-variant: "#005048"
  background: "#fff8f3"
  on-background: "#1f1b15"
  surface-variant: "#ebe1d8"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: 0.01em
  currency-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built for the premium Peruvian real estate market, blending the warm, earthy heritage of the region with the precision of modern PropTech. The brand personality is professional, high-trust, and accessible, catering to high-value transactions while remaining inviting to first-time buyers.

The visual style is **Corporate / Modern** with a touch of **Minimalism**. It prioritizes clarity and spatial breathing room to evoke a sense of luxury. By using tactile colors inspired by traditional Peruvian textiles and architecture (Terracotta and Adobe), the system establishes a local resonance that global platforms lack, while maintaining the technical sophistication of a world-class SaaS product.

## Colors

The palette is anchored by **Terracotta**, a primary color that signifies stability and earth. It is supported by **Adobe Warm** as an accent to highlight interactive elements and secondary actions.

**Light Mode (Default):** Uses a warm off-white background to reduce eye strain and provide a "gallery" feel for property photos. Borders are kept subtle to maintain an open, airy layout.
**Dark Mode:** Transitions to a Zinc-based grayscale to maintain high contrast and accessibility while preserving the warmth of the primary Terracotta accents.

Status colors (Emerald, Amber, Red) are used strictly for inventory management (Available, Reserved, Sold) to provide immediate, unambiguous feedback in property listings.

## Typography

This design system utilizes a tiered typography scale to ensure a clear information hierarchy. **Plus Jakarta Sans** is used for headings to provide a soft, welcoming, yet professional tone. **Hanken Grotesk** is used for all body text and labels for its exceptional legibility and contemporary feel.

A specialized `currency-md` style is defined for price displays, utilizing **tabular numbers** (`tnum`) to ensure that monetary values align perfectly in listings and comparison tables, which is critical for real estate data integrity. Large displays use tighter letter spacing to maintain a premium, editorial look.

## Layout & Spacing

The layout follows a **12-column fluid grid** on desktop with generous 64px external margins to frame content like a premium catalog. On mobile, the system collapses to a single column with 16px margins to maximize screen real estate for property imagery.

Spacing follows an 8px base unit rhythm. Consistent use of the `md` (24px) unit for gutters and padding between related elements ensures a balanced, systematic appearance. Content-heavy pages (like property details) should utilize the `xl` (80px) vertical spacing between major sections to prevent information density from overwhelming the user.

## Elevation & Depth

This design system uses **Tonal Layers** and **Ambient Shadows** to create a sense of organized depth.

1.  **Level 0 (Background):** Warm off-white (#F8F6F3).
2.  **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(160, 152, 144, 0.08)).
3.  **Level 2 (Modals/Pop-overs):** Pure White with a more pronounced shadow (0px 12px 32px rgba(160, 152, 144, 0.15)) and a subtle 1px border (#E4DCD3).

Interactive elements should not use heavy shadows but rather a "lift" effect on hover, where the shadow slightly expands and the border color darkens to the Primary Terracotta.

## Shapes

The shape language is defined by **rounded elegance**. A base radius of 8px (Level 2) is applied to standard buttons, input fields, and small cards. Larger containers, such as property feature cards and main layout modules, should use 16px (rounded-lg) to evoke a friendly and approachable feel.

Pill shapes are reserved exclusively for status chips (e.g., "For Sale") to distinguish them from interactive buttons. This distinction helps users quickly scan listing statuses without confusing them for clickable actions.

## Components

### Buttons

Primary buttons use the Terracotta background with white text. Secondary buttons use a transparent background with an Adobe Warm border. All buttons have a minimum height of 48px for mobile accessibility.

### Input Fields

Inputs utilize the Surface White color with a Subtle Beige border. Upon focus, the border transitions to Terracotta. Labels use `label-md` and are placed consistently above the field.

### Property Cards

Cards are the core of the system. They feature a 16px corner radius, a subtle ambient shadow, and a "hover lift" animation. The price is always displayed using the `currency-md` style in the bottom left corner.

### Status Chips

Compact, pill-shaped elements with low-opacity backgrounds (e.g., 10% Emerald for "Available") and high-contrast text. These are placed in the top-right corner of property images.

### Maps & Location

Map markers use the Terracotta primary color with a white inner icon. Clusters use the Adobe Warm accent to differentiate from individual listings.
