# Property Detail Specification

## Purpose

Define el panel de detalle de propiedad: modal centrado con fade overlay en desktop, slide desde derecha (full panel) en mobile, hero image 192px, galería horizontal, specs grid y CTA.

## Requirements

### REQ-PD-01: Desktop Centered Modal

On viewports ≥ 768px, clicking "Ver detalle" MUST open a centered modal (max-w-lg) with a semi-transparent backdrop overlay and fade transition.

#### Scenario: Detail modal opens with fade

- GIVEN a property card or marker is clicked on desktop
- WHEN the user clicks "Ver detalle"
- THEN a modal MUST appear centered in the viewport
- AND it MUST have max-width of lg (32rem / 512px)
- AND a semi-transparent backdrop MUST overlay the map
- AND the transition MUST be a fade + subtle scale

#### Scenario: Detail modal closes

- GIVEN the detail modal is open
- WHEN the user clicks the backdrop, close button, or presses Escape
- THEN the modal MUST fade out
- AND the map MUST be interactive again

### REQ-PD-02: Mobile Slide-from-Right Panel

On viewports < 768px, clicking "Ver detalle" MUST open a full-screen panel sliding from the right edge (100vw × 100vh).

#### Scenario: Detail panel slides in from right

- GIVEN a property card is clicked on mobile
- WHEN the user taps "Ver detalle"
- THEN a panel MUST animate from the right edge
- AND it MUST occupy 100vw × 100vh
- AND it MUST have a close button (ArrowLeft or X) in the top-left
- AND the map behind MUST be hidden

#### Scenario: Detail panel closes on mobile

- GIVEN the detail panel is open on mobile
- WHEN the user taps the close button
- THEN the panel MUST slide back to the right
- AND the showroom view MUST be visible again

### REQ-PD-03: Hero Image

The detail panel MUST display a hero image (100% width, 192px height) with a black gradient overlay (60% opacity at bottom) containing the price, property code, and status badge.

#### Scenario: Hero renders with correct specs

- GIVEN the detail panel is open
- THEN a hero image MUST fill 100% width at 192px height
- AND a black gradient MUST darken the bottom 60% (from transparent to black)
- AND the price MUST display in white over the overlay
- AND the property code MUST display below the price
- AND the hero MAY use object-fit: cover

### REQ-PD-04: Status Badge Overlay

The hero image MUST display a status badge in the top-left corner, colored according to property state (green/amber/red).

#### Scenario: Status badge shows on hero

- GIVEN the detail panel is open
- THEN a status badge MUST appear in the top-left corner of the hero
- AND the badge color MUST match --status-success/warning/destructive
- AND the text MUST read "Disponible", "Separado", or "Vendido"

### REQ-PD-05: Specs Grid

The detail panel MUST display a 3-column grid with icons: area m², dormitorios, baños.

#### Scenario: Specs grid shows property attributes

- GIVEN the detail panel is open
- THEN a 3-column grid MUST display below the hero
- AND each cell MUST show an icon + value + label
- AND icons MUST use Lucide equivalents (Ruler, Bed, Bath)

### REQ-PD-06: Gallery

The detail panel SHOULD display a horizontally scrollable gallery of thumbnail images (112x80) below the description text.

#### Scenario: Gallery scrolls horizontally

- GIVEN the detail panel has multiple property images
- THEN a horizontal scrollable row MUST display thumbnails
- AND each thumbnail MUST be 112x80 with rounded corners
- AND clicking a thumbnail SHOULD not open a modal in v1

### REQ-PD-07: CTA Button

The detail panel MUST display a "Contactar" CTA button (full-width, terracotta primary color) at the bottom of the panel.

#### Scenario: CTA opens lead form

- GIVEN the detail panel is open
- THEN a "Contactar" button MUST be visible at the bottom
- AND it MUST be full-width with bg-primary color
- AND clicking it MUST open the LeadForm modal for this property
