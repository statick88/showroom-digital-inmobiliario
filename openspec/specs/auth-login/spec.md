# Auth Login Specification

## Purpose

Define la página de login para administradores, auth guard para /admin, root redirect, y session management con Supabase Auth.

## ADDED Requirements

### REQ-AL-01: Login Page

The system MUST provide a login page at /login with email and password inputs, styled with the brand terracotta palette.

#### Scenario: Login page renders

- GIVEN the user navigates to /login
- THEN a centered card MUST display with the brand logo
- AND an email input MUST be present
- AND a password input MUST be present (type=password)
- AND a toggle password visibility SHALL be available (Eye/EyeOff icon)
- AND a submit button "Ingresar" in terracotta MUST be present
- AND a "Remember me" checkbox MAY be present

#### Scenario: Successful login

- GIVEN the user enters valid email and password
- WHEN they click "Ingresar"
- THEN the system MUST authenticate via Supabase Auth
- AND redirect to /admin/dashboard
- AND a session cookie MUST be set

#### Scenario: Failed login

- GIVEN the user enters invalid credentials
- WHEN they click "Ingresar"
- THEN an error message MUST display: "Credenciales inválidas"
- AND the form MUST NOT redirect
- AND the password input MUST retain its value

### REQ-AL-02: Auth Guard

The /admin/* routes MUST be protected. Unauthenticated access MUST redirect to /login.

#### Scenario: Unauthenticated access redirects

- GIVEN the user is NOT logged in
- WHEN they navigate to /admin/*
- THEN they MUST be redirected to /login
- AND the original URL MUST be preserved as a redirect param (?redirect=/admin/dashboard)

#### Scenario: Authenticated access proceeds

- GIVEN the user IS logged in
- WHEN they navigate to /admin/dashboard
- THEN the admin dashboard MUST render
- AND they MUST NOT be redirected

### REQ-AL-03: Session Management

The system MUST maintain session state using Supabase Auth with auto-refresh.

#### Scenario: Session persists across reloads

- GIVEN the user logged in successfully
- WHEN they reload the page
- THEN they MUST remain authenticated
- AND the admin dashboard MUST render without re-login

#### Scenario: Session expires

- GIVEN the user's session has expired
- WHEN they access /admin/*
- THEN they MUST be redirected to /login
- AND a message "Sesión expirada" MAY display on the login page

### REQ-AL-04: Root Redirect

The root route (/) MUST redirect to the showroom main page (/showroom or /).

#### Scenario: Root redirects to showroom

- GIVEN the user navigates to /
- WHEN the page loads
- THEN they MUST be redirected to the showroom map view
- AND no login MUST be required

### REQ-AL-05: No Public Registration

The system MUST NOT expose a public registration page or sign-up endpoint.

#### Scenario: Registration endpoint is unavailable

- GIVEN the user is not logged in
- WHEN they attempt to access /signup or /register
- THEN they MUST receive a 404 Not Found
- OR be redirected to /login
