# Delta for Showroom Layout

## MODIFIED Requirements

### Requirement: REQ-SL-02: Header Navigation → Auth-Aware Header

The system SHALL display a fixed header with "Showroom Inmobiliario" logo on the left and authentication controls on the right that adapt to auth state.

(Previously: Header showed brand on left and Admin button (Lock icon) on right)

#### Scenario: Unauthenticated user sees login/register buttons

- GIVEN the user is NOT logged in
- WHEN the showroom page renders
- THEN the header MUST be visible at the top
- AND it MUST contain the brand text "Showroom Inmobiliario" on the left
- AND it MUST contain "Iniciar Sesión" button on the right (navigates to `#auth` with Login tab)
- AND it MUST contain "Registrarse" button on the right (navigates to `#auth` with Register tab)
- AND the Admin button (Lock icon) MUST still be present for admin access

#### Scenario: Authenticated user sees user dropdown

- GIVEN the user IS logged in (any role: comprador, vendedor, admin)
- WHEN the showroom page renders
- THEN the header MUST be visible at the top
- AND it MUST contain the brand text on the left
- AND it MUST contain a user dropdown on the right (replacing login/register buttons)
- AND the dropdown trigger MUST show user avatar with initials
- AND the dropdown MUST display user's name
- AND the dropdown MUST display role badge (Comprador / Vendedor / Admin)
- AND the dropdown MUST contain a "Cerrar sesión" button

#### Scenario: User dropdown logout clears session

- GIVEN the user is authenticated and opens the user dropdown
- WHEN they click "Cerrar sesión"
- THEN the `useAuthStore.reset()` MUST be called
- AND the user MUST be redirected to `#showroom`
- AND the header MUST show login/register buttons again

#### Scenario: Role badge displays correct role

- GIVEN the user has rol `comprador` in `useAuthStore`
- WHEN the dropdown opens
- THEN a badge "Comprador" with neutral style MUST display
- GIVEN the user has rol `vendedor`
- WHEN the dropdown opens
- THEN a badge "Vendedor" with accent style MUST display
- GIVEN the user has rol `admin`
- WHEN the dropdown opens
- THEN a badge "Admin" with destructive style MUST display

#### Scenario: Mobile responsive header

- GIVEN a viewport width < 768px
- WHEN the header renders
- THEN the logo and auth controls MUST remain visible
- AND the dropdown MUST be full-width on mobile
- AND touch targets MUST be ≥ 44px

## ADDED Requirements

### Requirement: REQ-SL-09: User Avatar Generation

The system MUST generate user avatars from initials when no profile image exists.

#### Scenario: Avatar shows initials

- GIVEN the user has name "Juan Pérez"
- WHEN the avatar renders
- THEN a circle with "JP" initials MUST display
- AND the background color MUST be deterministic from the name

#### Scenario: Avatar fallback for single name

- GIVEN the user has name "María"
- WHEN the avatar renders
- THEN a circle with "M" initial MUST display