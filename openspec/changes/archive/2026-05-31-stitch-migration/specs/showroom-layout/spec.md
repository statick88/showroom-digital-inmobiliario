# Showroom Layout Specification

## Purpose

Define el layout responsivo del showroom principal: split sidebar+map en desktop, stack map+lista en mobile, header nav, markers, property list y filtros.

## Requirements

### REQ-SL-01: Desktop Split Layout

The system MUST render a two-column grid layout on viewports ≥ 768px: sidebar (380px) for property list + map area filling the remaining space.

#### Scenario: Desktop layout renders correctly

- GIVEN a viewport width ≥ 768px
- WHEN the showroom page loads
- THEN the layout MUST display a sidebar of 380px on the left
- AND the map MUST fill the remaining width

### REQ-SL-02: Header Navigation

The system SHALL display a fixed header with "Showroom Inmobiliario" logo on the left and an Admin button (Lock icon) on the right.

#### Scenario: Header shows on all pages

- GIVEN the user is on the showroom page
- WHEN the page renders
- THEN the header MUST be visible at the top
- AND it MUST contain the brand text on the left
- AND it MUST contain an Admin button with Lock icon on the right

### REQ-SL-03: Mobile Stack Layout

On viewports < 768px, the system MUST stack the map (50vh) above the property list in a vertical column.

#### Scenario: Mobile layout renders correctly

- GIVEN a viewport width < 768px
- WHEN the showroom page loads
- THEN the map MUST occupy the top 50vh
- AND the property list MUST appear below the map in a scrollable column

### REQ-SL-04: Map Markers

The system MUST render property markers on the map as circles (16px diameter) with white border (2px). Color MUST match property status: green (Disponible), amber (Separado), red (Vendido).

#### Scenario: Markers render with correct colors

- GIVEN the map is loaded with properties
- THEN each property MUST appear as a 16px circle marker
- AND Disponible markers MUST be green (--status-success)
- AND Separado markers MUST be amber (--status-warning)
- AND Vendido markers MUST be red (--status-destructive)
- AND each marker MUST have a 2px white border

#### Scenario: Marker click shows popup

- GIVEN a marker is on the map
- WHEN the user clicks a marker
- THEN a popup MUST display with: thumbnail 80x80, title, price with currency symbol (S/ or $), district, status badge, and "Ver detalle" button

### REQ-SL-05: Property List Cards

The system MUST display property cards in a horizontal layout: thumbnail 80x80 on the left, info on the right (title, location, price with currency, status badge).

#### Scenario: Property list renders cards

- GIVEN the property list has data
- THEN each card MUST show a thumbnail (80x80) on the left
- AND the title MUST be on the top right
- AND location below the title
- AND price with currency symbol below location
- AND a status badge in the top-right corner of the card

### REQ-SL-06: Property Filters

The system MUST display a filter bar above the property list with: Tipo, Estado, Distrito, Precio Min/Max, Moneda, and a "Limpiar filtros" button.

#### Scenario: Filters render correctly

- GIVEN the showroom page loads
- THEN Tipo filter MUST show options: Lote, Departamento, Casa, Local
- AND Estado filter MUST show: Todos, Disponible, Separado, Vendido
- AND Distrito MUST be a dropdown with Lima districts
- AND Precio MUST have Min and Max inputs
- AND Moneda MUST toggle between S/, $, and Todas
- AND a "Limpiar filtros" button MUST reset all filters

#### Scenario: Filters update property list

- GIVEN the user selects "Disponible" and "San Isidro"
- WHEN filters change
- THEN the property list MUST update to show only matching properties
- AND markers on the map MUST filter accordingly

### REQ-SL-07: Glass Map Controls

The system SHOULD render custom map controls (zoom +/-, geolocation, Map/Satélite toggle) as glass buttons with backdrop-blur.

#### Scenario: Glass controls render and work

- GIVEN the map is rendered
- THEN zoom + and - buttons MUST be visible as a glass-styled group
- AND a geolocation button MUST center the map on user's position when available
- AND a Map/Satélite toggle MUST switch the tile layer between street and satellite
