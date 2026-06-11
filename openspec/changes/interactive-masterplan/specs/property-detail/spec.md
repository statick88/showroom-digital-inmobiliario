# Property Detail Specification (Delta)

## Purpose

Delta spec for `property-detail` capability: adds a new entry point from the 360° tour overlay so that clicking a parcel badge in the virtual tour opens the same detail panel.

## MODIFIED Requirements

### REQ-PD-01: Desktop Centered Modal

On viewports ≥ 768px, clicking "Ver detalle" MUST open a centered modal (max-w-lg) with a semi-transparent backdrop overlay and fade transition. The modal MUST also open when a parcel badge is clicked in the 360° virtual tour overlay.

(Previously: Modal only opened from property cards on the map view)

#### Scenario: Detail modal opens with fade

- GIVEN a property card or marker is clicked on desktop
- WHEN the user clicks "Ver detalle"
- THEN a modal MUST appear centered in the viewport
- AND it MUST have max-width of lg (32rem / 512px)
- AND a semi-transparent backdrop MUST overlay the map
- AND the transition MUST be a fade + subtle scale

#### Scenario: Detail modal opens from tour overlay

- GIVEN the user is in the 360° virtual tour view on desktop
- WHEN the user clicks a parcel badge (L-01)
- THEN the SAME centered modal MUST open
- AND it MUST display the parcel's `FichaTecnicaLote` data
- AND the backdrop MUST overlay the tour canvas

#### Scenario: Detail modal closes

- GIVEN the detail modal is open
- WHEN the user clicks the backdrop, close button, or presses Escape
- THEN the modal MUST fade out
- AND the underlying view (map or tour) MUST be interactive again

### REQ-PD-02: Mobile Slide-from-Right Panel

On viewports < 768px, clicking "Ver detalle" MUST open a full-screen panel sliding from the right edge (100vw × 100vh). This panel MUST also open from the tour overlay as a bottom-sheet instead.

(Previously: Panel only opened from property cards on map view, always slide-from-right)

#### Scenario: Detail panel slides in from right

- GIVEN a property card is clicked on mobile
- WHEN the user taps "Ver detalle"
- THEN a panel MUST animate from the right edge
- AND it MUST occupy 100vw × 100vh
- AND it MUST have a close button (ArrowLeft or X) in the top-left
- AND the map behind MUST be hidden

#### Scenario: Tour overlay opens bottom-sheet

- GIVEN the user is in the 360° tour on mobile
- WHEN the user taps a parcel badge
- THEN a bottom-sheet MUST slide up from the bottom
- AND it MUST occupy the lower 60% of the viewport
- AND swiping down MUST dismiss the panel
- AND the tour canvas MUST remain partially visible above

#### Scenario: Detail panel closes on mobile

- GIVEN the detail panel is open on mobile
- WHEN the user taps the close button
- THEN the panel MUST slide back to the right (or down for bottom-sheet)
- AND the showroom view MUST be visible again

## REMOVED Requirements

None.

## RENAMED Requirements

None.
