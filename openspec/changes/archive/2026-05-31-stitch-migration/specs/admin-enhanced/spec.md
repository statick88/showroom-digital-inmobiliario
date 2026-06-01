# Admin Enhanced Specification

## Purpose

Define las mejoras al dashboard de administración: donut chart, progress bar, top clicked ranking, tabla editable con dropdown de estado, search, leads table, y responsive mobile.

## ADDED Requirements

### REQ-AE-01: Donut Chart

The admin dashboard MUST display a donut/ring chart showing the proportion of property states (Disponible / Separado / Vendido) with respective status colors.

#### Scenario: Donut renders with correct proportions

- GIVEN the admin dashboard loads
- THEN a donut chart MUST display with 3 segments
- AND the Disponible segment MUST use --status-success color
- AND the Separado segment MUST use --status-warning color
- AND the Vendido segment MUST use --status-destructive color
- AND a legend MUST label each segment with count and percentage

### REQ-AE-02: Progress Bar

The admin dashboard MUST display a horizontal progress bar showing "Cumplimiento de Ventas" with the format "S/ {actual} / S/ {meta}".

#### Scenario: Progress bar shows correct percentage

- GIVEN the admin dashboard loads
- THEN a progress bar MUST display with a gradient fill
- AND the fill width MUST equal (total_sold / sales_target) * 100%
- AND the color MUST shift from teal-green to amber as it approaches the target

### REQ-AE-03: Top Clicked Properties

The admin dashboard MUST display a ranked table of the top 5 most-clicked properties with position, thumbnail, code, title, and total clicks.

#### Scenario: Top clicked table renders

- GIVEN the admin dashboard loads
- THEN a table MUST display with columns: position (#1-5), thumbnail, code, title, total clicks
- AND rows MUST be ordered by click count descending
- AND the #1 property MUST have a highlighted rank badge

### REQ-AE-04: Editable Status Dropdown

Each property row in the Properties table MUST have a dropdown to change status: Disponible → Separado → Vendido.

#### Scenario: Status change flow

- GIVEN the asesor is on the Properties tab
- WHEN they click the status dropdown and select "Separado"
- THEN a confirmation dialog MUST appear: "¿Separar lote {code}?"
- AND an optional CCI input MUST be available (format: 002-XXXXXXXXXXXX-XX)
- AND an optional payment method select MUST be available (Efectivo, Transferencia, Financiamiento)
- WHEN they confirm
- THEN the status MUST update in the database via PATCH
- AND the badge color MUST change immediately
- AND a success toast MUST appear: "Estado actualizado"

### REQ-AE-05: Search & Filter

The Properties table MUST include a text search input and a status filter dropdown.

#### Scenario: Search filters properties

- GIVEN the asesor types "LT-042" in the search input
- THEN the table MUST filter to show only matching properties
- AND the filter MUST match by code, title, and district

#### Scenario: Status filter

- GIVEN the asesor selects "Separado" from the status filter
- THEN the table MUST show only Separado properties

### REQ-AE-06: Admin User Profile

The admin sidebar MUST display the logged-in user's name and email at the bottom, with a logout button (LogOut icon).

#### Scenario: User profile shows in sidebar

- GIVEN the asesor is logged in
- WHEN the admin page renders
- THEN the sidebar MUST show the user's name
- AND their email below the name
- AND a logout button with LogOut icon at the bottom

### REQ-AE-07: Leads Table

The Leads tab MUST display a table with: Nombre, Email, Teléfono, Propiedad (code + title), Fecha (dd/mm/aaaa), and a "Ver" button per row.

#### Scenario: Leads table renders

- GIVEN the asesor is on the Leads tab
- THEN a table MUST show columns: Nombre, Email, Teléfono, Propiedad, Fecha
- AND the Fecha MUST be formatted as dd/mm/aaaa
- AND each row MUST have a "Ver" button

#### Scenario: Lead detail opens

- GIVEN a lead row is displayed
- WHEN the asesor clicks "Ver"
- THEN a detail view MUST open showing the lead's score and notes
- AND the associated property code and title

### REQ-AE-08: Admin Mobile Bottom Tabs

On viewports < 768px, the admin sidebar MUST collapse into a bottom tab bar with 3 tabs: Dashboard, Propiedades, Leads.

#### Scenario: Bottom tab bar on mobile

- GIVEN a viewport width < 768px
- WHEN the admin page loads
- THEN a bottom tab bar MUST display instead of the sidebar
- AND tabs MUST show: Dashboard (LayoutDashboard), Propiedades (Building2), Leads (MessageCircle)
- AND the active tab MUST be highlighted with primary color
