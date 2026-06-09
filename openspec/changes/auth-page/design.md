# Design: Auth Page

## Technical Approach

Implement a tabbed authentication page at `#auth` route with Login/Register forms, integrated with existing Supabase auth + Zustand store pattern. The Navbar will show login/register buttons when unauthenticated and a user dropdown (avatar + logout) when authenticated. All flows hydrate the existing `useAuthStore` which persists to localStorage.

## Architecture Decisions

### Decision: Auth Form State Management

| Option | Tradeoff | Decision |
|--------|----------|----------|
| React `useState` per form | Simple, local to component, no extra deps | **Chosen** |
| React Hook Form + Zod | Validation built-in, more boilerplate | Rejected — overkill for 2 forms |
| Zustand for form state | Shared state, persists | Rejected — forms don't need persistence |

**Rationale**: Forms are simple (email, password, name). Local state keeps components self-contained. Validation via inline helpers + Supabase error mapping.

### Decision: shadcn/ui Components to Install

| Component | Purpose | Install Command |
|-----------|---------|-----------------|
| `tabs` | Login/Register toggle | `pnpm dlx shadcn@latest add tabs` |
| `dropdown-menu` | User avatar dropdown | `pnpm dlx shadcn@latest add dropdown-menu` |
| `avatar` | User avatar in dropdown | `pnpm dlx shadcn@latest add avatar` |
| `label` | Form labels (if not present) | `pnpm dlx shadcn@latest add label` |

**Rationale**: These are the minimal shadcn/ui components needed. The project uses Base UI primitives + CVA variants — consistent with existing Button, Card, Input patterns.

### Decision: Register Flow — Auto-login After SignUp

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `signUp` → `signInWithPassword` auto-login | Seamless UX, single redirect | **Chosen** |
| `signUp` → email confirmation → manual login | More secure, extra step | Rejected — spec says auto-login |

**Rationale**: Spec requires auto-login after register. Supabase session returned by `signUp` can be used directly to hydrate store and redirect.

## Data Flow

### Login Flow
```
LoginForm (email, password)
       │
       ▼
supabase.auth.signInWithPassword()
       │
       ├── Error → map to user message → set form error
       │
       └── Success (session)
              │
              ▼
       usuariosRepository.getByAuthUserId(session.user.id)
              │
              ▼
       useAuthStore.setFromUsuariosRol(row, { sessionChecked: true })
              │
              ▼
       window.location.hash = "#app" (or intended route)
```

### Register Flow
```
RegisterForm (email, password, nombre)
       │
       ▼
supabase.auth.signUp({ email, password, options: { data: { nombre } } })
       │
       ├── Error → map to user message → set form error
       │
       └── Success (session)
              │
              ▼
       Insert into usuarios_rol (auth_user_id, email, nombre, rol='comprador')
              │
              ▼
       Use session from signUp to hydrate store (no extra signIn call)
              │
              ▼
       useAuthStore.setFromUsuariosRol(newRow, { sessionChecked: true })
              │
              ▼
       window.location.hash = "#app"
```

### Logout Flow
```
UserDropdown → Logout button
       │
       ▼
supabase.auth.signOut()
       │
       ▼
useAuthStore.reset()  // clears auth fields, keeps sessionChecked=true
       │
       ▼
window.location.hash = "#showroom"
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/presentation/components/auth/AuthPage.tsx` | Create | Main auth page with tabs, renders LoginForm/RegisterForm |
| `src/presentation/components/auth/LoginForm.tsx` | Create | Login form with email/password, validation, Supabase integration |
| `src/presentation/components/auth/RegisterForm.tsx` | Create | Register form with email/password/nombre, creates usuarios_rol |
| `src/presentation/components/auth/UserDropdown.tsx` | Create | Avatar dropdown with user info + logout button |
| `src/presentation/components/shared/Navbar.tsx` | Modify | Add auth buttons (unauth) / UserDropdown (auth) |
| `src/App.tsx` | Modify | Add `#auth` route handling, render AuthPage |
| `src/presentation/hooks/useAuthStore.ts` | Modify | Add `signUp` helper method (optional, can stay in AuthPage) |

## Interfaces / Contracts

### AuthFormState (local to forms)
```typescript
interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
}

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  error: string | null;
  isLoading: boolean;
}
```

### Supabase Error Mapping
```typescript
function mapAuthError(error: AuthError): string {
  switch (error.message) {
    case "Invalid login credentials":
      return "Credenciales inválidas. Verifica tu email y contraseña.";
    case "Email not confirmed":
      return "Confirma tu email antes de iniciar sesión.";
    case "User already registered":
      return "Este email ya está registrado. Intenta iniciar sesión.";
    case "Password should be at least 6 characters":
      return "La contraseña debe tener al menos 6 caracteres.";
    default:
      return "Error inesperado. Intenta de nuevo.";
  }
}
```

### AuthPage Props (none — self-contained)
```typescript
// No props needed — reads route from hash, manages own state
```

### UserDropdown Props
```typescript
interface UserDropdownProps {
  nombre: string;
  email: string;
  onLogout: () => void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `mapAuthError` maps all known Supabase errors | Vitest — pure function tests |
| Unit | `LoginForm` validation (empty, invalid email, short password) | React Testing Library — fireEvent + expect |
| Unit | `RegisterForm` validation (password match, required fields) | React Testing Library |
| Unit | `useAuthStore` hydration from signUp session | Mock Supabase, test store update |
| Integration | Full login flow: form → Supabase → store → redirect | MSW mock Supabase, test navigation |
| Integration | Full register flow: form → signUp → insert usuarios_rol → auto-login | MSW mock Supabase + RPC |
| Integration | Navbar shows correct state (buttons vs dropdown) | Render with mocked `useAuthStore` |
| E2E | Login → redirect to #app → Navbar shows user | Playwright — real Supabase test project |
| E2E | Register → auto-login → redirect | Playwright |
| E2E | Logout → redirect to #showroom → Navbar shows buttons | Playwright |

## Migration / Rollout

No migration required. New route `#auth` added. Existing routes unchanged. The `useAuthStore` already handles `sessionChecked` flag correctly for RoleGuard.

## Open Questions

- [ ] Should RegisterForm include `telefono` field? (Spec only mentions email, password, nombre)
- [ ] Does the `usuarios_rol` insert need `dni` for comprador role? (Current schema: dni is required on create)
- [ ] Should we add "Forgot password" link on LoginForm? (Not in spec, but common UX)
- [ ] Confirm: after register auto-login, redirect to `#app` (showroom with proyecto) or `#showroom`?
- [ ] Need to install shadcn/ui components: `tabs`, `dropdown-menu`, `avatar`, `label` — confirm versions