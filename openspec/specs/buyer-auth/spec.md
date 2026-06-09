# Buyer Auth Specification

## Purpose

Define la página de autenticación pública para compradores (rol: comprador) con login y registro tabulados en la ruta `#auth`. Integra con Supabase Auth `signUp`/`signInWithPassword` y asigna rol via `usuarios_rol` al registrar.

## Requirements

### REQ-BA-01: Auth Page with Tabbed Forms

The system MUST provide an AuthPage at `#auth` route with two tabs: "Iniciar Sesión" and "Registrarse", styled with the brand terracotta palette.

#### Scenario: Auth page renders with login tab active by default

- GIVEN the user navigates to `#auth`
- THEN a centered card MUST display with the brand logo
- AND a tab bar MUST show "Iniciar Sesión" (active) and "Registrarse"
- AND the Login tab content MUST be visible

#### Scenario: User switches to Register tab

- GIVEN the user is on `#auth` with Login tab active
- WHEN they click "Registrarse" tab
- THEN the Register tab content MUST display
- AND the Login tab content MUST be hidden

#### Scenario: Deep link to Register tab

- GIVEN the user navigates to `#auth?tab=register`
- THEN the Register tab MUST be active
- AND the Register form MUST be visible

### REQ-BA-02: Login Form

The Login tab MUST contain email, password, and "¿Olvidaste tu contraseña?" link with validation.

#### Scenario: Login form renders correctly

- GIVEN the Login tab is active
- THEN an email input MUST be present (type=email, required)
- AND a password input MUST be present (type=password, required)
- AND a toggle password visibility SHALL be available (Eye/EyeOff icon)
- AND a submit button "Ingresar" in terracotta MUST be present
- AND a "¿Olvidaste tu contraseña?" link MUST be present
- AND a "¿No tienes cuenta? Regístrate" link SHALL navigate to Register tab

#### Scenario: Successful buyer login

- GIVEN the user enters valid email and password for a comprador account
- WHEN they click "Ingresar"
- THEN the system MUST authenticate via Supabase Auth `signInWithPassword`
- AND hydrate `useAuthStore` from `usuarios_rol` via `setFromUsuariosRol()`
- AND redirect to `#showroom`
- AND the Navbar MUST show user dropdown

#### Scenario: Failed login with invalid credentials

- GIVEN the user enters invalid email or password
- WHEN they click "Ingresar"
- THEN an error message MUST display: "Credenciales inválidas"
- AND the form MUST NOT redirect
- AND the password input MUST retain its value
- AND the email input MUST retain its value

#### Scenario: Login with admin account redirects to admin

- GIVEN the user enters valid admin credentials
- WHEN they click "Ingresar"
- THEN the system MUST authenticate via Supabase Auth
- AND hydrate store with rol `admin`
- AND redirect to `#admin` (not `#showroom`)

#### Scenario: Login with vendedor account redirects to vendedor panel

- GIVEN the user enters valid vendedor credentials
- WHEN they click "Ingresar"
- THEN the system MUST authenticate via Supabase Auth
- AND hydrate store with rol `vendedor`
- AND redirect to `#vendedor`

### REQ-BA-03: Register Form

The Register tab MUST contain name, email, password, confirm password with validation.

#### Scenario: Register form renders correctly

- GIVEN the Register tab is active
- THEN a name input MUST be present (type=text, required, min 2 chars)
- AND an email input MUST be present (type=email, required)
- AND a password input MUST be present (type=password, required, min 8 chars)
- AND a confirm password input MUST be present (type=password, required)
- AND a submit button "Crear cuenta" in terracotta MUST be present
- AND a "¿Ya tienes cuenta? Inicia sesión" link SHALL navigate to Login tab

#### Scenario: Successful buyer registration

- GIVEN the user enters valid name, email, password, and matching confirm password
- WHEN they click "Crear cuenta"
- THEN the system MUST call `useAuthStore.signUp(email, password, name)`
- AND create Supabase Auth user via `signUp`
- AND insert row in `usuarios_rol` with `rol: 'comprador'` and `auth_user_id`
- AND hydrate store via `setFromUsuariosRol()`
- AND redirect to `#showroom`
- AND the Navbar MUST show user dropdown with comprador role badge

#### Scenario: Registration fails with duplicate email

- GIVEN the user enters an email already registered in Supabase Auth
- WHEN they click "Crear cuenta"
- THEN an error message MUST display: "Este email ya está registrado"
- AND the form MUST NOT redirect
- AND the inputs MUST retain their values

#### Scenario: Registration fails with weak password

- GIVEN the user enters a password shorter than 8 characters
- WHEN they click "Crear cuenta"
- THEN an error message MUST display: "La contraseña debe tener al menos 8 caracteres"
- AND the form MUST NOT submit

#### Scenario: Registration fails with password mismatch

- GIVEN the user enters non-matching passwords
- WHEN they click "Crear cuenta"
- THEN an error message MUST display: "Las contraseñas no coinciden"
- AND the form MUST NOT submit

#### Scenario: Registration fails with invalid name

- GIVEN the user enters a name shorter than 2 characters
- WHEN they click "Crear cuenta"
- THEN an error message MUST display: "El nombre debe tener al menos 2 caracteres"
- AND the form MUST NOT submit

### REQ-BA-04: Password Reset Flow

The system MUST support password reset via Supabase `resetPasswordForEmail`.

#### Scenario: User requests password reset

- GIVEN the user clicks "¿Olvidaste tu contraseña?" on Login tab
- WHEN they enter their email and submit
- THEN the system MUST call Supabase `resetPasswordForEmail` with redirect to `#auth?reset=true`
- AND a success message MUST display: "Si el email existe, recibirás instrucciones para restablecer tu contraseña"

#### Scenario: User resets password via email link

- GIVEN the user clicks the reset link in email (contains access token)
- WHEN they land on `#auth?reset=true&access_token=...`
- THEN a "Nueva contraseña" form MUST display
- AND they MUST enter new password and confirm
- AND on submit, the password MUST be updated via Supabase
- AND they MUST be redirected to Login tab with success message

### REQ-BA-05: Auth Store SignUp Method

The `useAuthStore` MUST provide a `signUp(email, password, name)` method for buyer registration.

#### Scenario: signUp creates auth user and usuarios_rol row

- GIVEN `signUp("user@test.com", "password123", "Juan Pérez")` is called
- WHEN Supabase Auth `signUp` succeeds
- THEN a row MUST be inserted in `usuarios_rol` with:
  - `auth_user_id` = new auth user ID
  - `nombre` = "Juan Pérez"
  - `email` = "user@test.com"
  - `rol` = 'comprador'
- AND `setFromUsuariosRol()` MUST be called with the new row
- AND the method MUST return the created user data

#### Scenario: signUp rolls back on usuarios_rol insert failure

- GIVEN Supabase Auth `signUp` succeeds but `usuarios_rol` insert fails
- WHEN the transaction fails
- THEN the auth user SHOULD be deleted (cleanup)
- AND an error MUST be thrown: "Error al crear perfil de usuario"

### REQ-BA-06: Mobile Responsive Layout

The AuthPage MUST be fully responsive for mobile viewports (82% traffic mobile per config).

#### Scenario: Auth page renders on mobile viewport

- GIVEN a viewport width < 768px
- WHEN the AuthPage loads
- THEN the card MUST use full width with 16px margins
- AND inputs MUST be full width
- AND tab bar MUST be scrollable if needed
- AND all touch targets MUST be ≥ 44px

### REQ-BA-07: WCAG 2.1 AA Compliance

The AuthPage MUST meet WCAG 2.1 AA accessibility requirements.

#### Scenario: Form labels and focus states

- GIVEN the AuthPage renders
- THEN all inputs MUST have associated `<label>` elements
- AND focus indicators MUST be visible (2px outline, offset 2px)
- AND color contrast MUST meet 4.5:1 for text
- AND error messages MUST be announced via `aria-live="polite"`
- AND tab order MUST be logical (email → password → submit)

#### Scenario: Screen reader announces auth state changes

- GIVEN the user logs in successfully
- WHEN the redirect occurs
- THEN the new page MUST have a heading announcing the authenticated state
- AND the Navbar dropdown MUST have `aria-expanded` and `aria-haspopup`