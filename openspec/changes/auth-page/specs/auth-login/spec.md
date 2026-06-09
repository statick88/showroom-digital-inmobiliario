# Delta for Auth Login

## MODIFIED Requirements

### Requirement: REQ-AL-05: No Public Registration → Buyer Registration Allowed

The system MUST allow public registration for buyers (rol: comprador) at the `#auth` route while keeping admin registration restricted to the `/login` route.

(Previously: The system MUST NOT expose a public registration page or sign-up endpoint)

#### Scenario: Buyer registration available at #auth

- GIVEN the user navigates to `#auth`
- WHEN they click the "Registrarse" tab
- THEN a registration form MUST be available for comprador role
- AND on submit, a Supabase Auth user is created with rol `comprador` in `usuarios_rol`

#### Scenario: Admin registration remains restricted at /login

- GIVEN the user navigates to `/login` (admin login route)
- WHEN they attempt to access `/signup` or `/register`
- THEN they MUST receive a 404 Not Found
- OR be redirected to `/login`

#### Scenario: Registration endpoint separation

- GIVEN the system has two auth entry points
- THEN `#auth` (hash route) SHALL serve buyer login/register
- AND `/login` (path route) SHALL serve admin login only
- AND these routes MUST NOT share registration logic

#### Scenario: Role-based redirect after login

- GIVEN a user logs in via `#auth` with comprador credentials
- WHEN authentication succeeds
- THEN they MUST redirect to `#showroom`
- GIVEN a user logs in via `/login` with admin credentials
- WHEN authentication succeeds
- THEN they MUST redirect to `/admin/dashboard`
- GIVEN a user logs in via `#auth` with vendedor credentials
- WHEN authentication succeeds
- THEN they MUST redirect to `#vendedor`