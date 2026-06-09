# Proposal: Auth Page for Buyers (Compradores)

## Intent

Buyers (compradores) currently have no way to log in or register. The only auth UI is `AdminLogin` at `#admin` hash route. This change adds a public auth page for buyers to create accounts and log in, enabling personalized features (saved favorites, alerts, inquiry history).

## Scope

### In Scope
- Create `AuthPage.tsx` with tabbed Login/Register forms at `#auth` route
- Add login/register buttons in `Navbar` for unauthenticated users
- Add user dropdown (profile, logout) in `Navbar` when authenticated
- Add `#auth` route handling in `App.tsx`
- Implement `signUp` in `useAuthStore` for buyer registration (role: comprador)

### Out of Scope
- Admin login flow (handled by existing `auth-login` spec at `/login`)
- Role management / user provisioning
- Email verification flow
- Password reset / forgot password
- Social login providers (Google, Apple)
- Session persistence beyond Supabase default

## Capabilities

### New Capabilities
- `buyer-auth`: Login/register UI for comprador role, tabbed form at `#auth`, integrates with Supabase Auth `signUp`/`signInWithPassword`, role assigned via `usuarios_rol` on registration

### Modified Capabilities
- `auth-login`: REQ-AL-05 "No Public Registration" must be relaxed to allow buyer registration at `#auth` while keeping admin registration restricted

## Approach

Single `AuthPage` component with two tabs (Login / Register) using shadcn/ui `Tabs`. Login tab reuses `signInWithPassword` pattern from `AdminLogin`. Register tab calls new `signUp(email, password)` in `useAuthStore` which:
1. Creates Supabase Auth user
2. Inserts row in `usuarios_rol` with `rol: 'comprador'`
3. Hydrates store via `setFromUsuariosRol()`

Hash routing (`#auth`) consistent with existing `#admin`, `#showroom`, `#vendedor` patterns. No router dependency.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/presentation/components/auth/AuthPage.tsx` | New | Tabbed login/register forms, validation, error handling |
| `src/presentation/components/shared/Navbar.tsx` | Modified | Add auth buttons (unauthed) / user dropdown (authed) |
| `src/App.tsx` | Modified | Add `#auth` case to hash routing switch |
| `src/stores/useAuthStore.ts` | Modified | Add `signUp()` method for buyer registration |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Supabase Auth rate limits on signUp | Low | Use Supabase defaults; monitor in staging |
| Duplicate accounts for same email | Low | Supabase Auth enforces unique email |
| Role assignment race condition | Low | Single `signUp` transaction; `usuarios_rol` insert after auth success |
| Breaking existing admin login | Low | Admin flow unchanged; separate route (`/login` vs `#auth`) |

## Rollback Plan

1. Revert `App.tsx` hash routing (remove `#auth` case)
2. Revert `Navbar.tsx` to prior version (remove auth buttons/dropdown)
3. Delete `AuthPage.tsx`
4. Revert `useAuthStore.ts` (remove `signUp` method)
5. No DB migration needed — Supabase Auth users remain but unused

## Dependencies

- shadcn/ui `Tabs` (already available)
- shadcn/ui `DropdownMenu`, `Avatar` for user dropdown — run `npx shadcn@latest add dropdown-menu avatar`
- Supabase client (configured)

## Success Criteria

- [ ] Unauthenticated user sees "Iniciar sesión" / "Registrarse" in Navbar
- [ ] Clicking "Registrarse" opens `#auth` with Register tab active
- [ ] Buyer can register with email/password → account created, role `comprador` assigned
- [ ] Buyer can log in → Navbar shows user avatar dropdown with logout
- [ ] Logout clears session, returns to unauthenticated Navbar state
- [ ] Admin login at `/login` continues working unchanged
- [ ] Mobile responsive (82% traffic mobile per config)
- [ ] WCAG 2.1 AA: form labels, focus states, contrast