# Design: Admin Vendedor Audit (PR-5)

## Technical Approach

This change implements the database layer for PR-5 (Admin Audit Log + Vendedor Management HU-009). The UI components, hooks, and tests are already implemented — only the database migrations, triggers, and Edge Function updates are missing.

The approach follows the existing migration patterns in `supabase/migrations/`:
- Three sequential migrations (00011, 00012, 00013) for atomic, reviewable changes
- SECURITY DEFINER trigger function for audit logging with JWT context extraction
- Partial unique index for DNI-per-project constraint
- Edge Function updated to validate new fields before insert

References: `openspec/changes/admin-vendedor-audit/specs/audit-log/spec.md` (REQ-AL-01..06), `openspec/changes/admin-vendedor-audit/specs/vendedor-management-db/spec.md` (REQ-VM-01..05).

## Architecture Decisions

### Decision: Audit Trigger Function — SECURITY DEFINER with JWT Extraction

**Choice**: Single `audit_trigger_fn()` attached to 7 tables via AFTER triggers, SECURITY DEFINER to read `usuarios_rol` for actor type determination.

**Alternatives considered**:
- Separate trigger per table — rejected: code duplication, harder maintenance
- Application-level audit (middleware) — rejected: misses direct DB changes, bypasses RLS
- pg_audit extension — rejected: not available on Supabase Cloud, overkill

**Rationale**: SECURITY DEFINER allows the trigger to bypass RLS and look up the caller's role in `usuarios_rol` even when the calling user wouldn't have permission. Extracts `actor_id` from `auth.uid()` and `actor_tipo` from role lookup. Falls back to 'system' or 'edge_function' when no JWT.

### Decision: Partial Unique Index for DNI per Project

**Choice**: `CREATE UNIQUE INDEX ... WHERE proyecto_id IS NOT NULL AND dni IS NOT NULL`

**Alternatives considered**:
- Full unique constraint on (proyecto_id, dni) — rejected: would block NULL values, breaking backward compat
- Application-level only — rejected: race condition, no DB guarantee
- Trigger-based check — rejected: more complex, same race condition risk

**Rationale**: Partial index enforces uniqueness only when both columns have values. Allows existing rows (NULL proyecto_id/dni) and non-vendedor roles to remain valid. Same DNI in different projects allowed — matches business requirement that a vendedor can work for multiple projects.

### Decision: Three Separate Migrations vs One Combined

**Choice**: Three migrations (00011 table, 00012 triggers, 00013 columns).

**Alternatives considered**:
- Single migration — rejected: too large for review, harder to rollback partial failures
- Two migrations (table+triggers, columns) — rejected: triggers depend on table, columns independent

**Rationale**: Follows existing pattern (00010 is standalone RPC). Each migration is independently reviewable and rollbackable. 00012 depends on 00011; 00013 is independent.

### Decision: Edge Function Validates Before Insert

**Choice**: Function checks `proyecto_id` exists and `dni` uniqueness before calling `auth.admin.createUser`.

**Alternatives considered**:
- Let DB constraint fail and catch error — rejected: wastes auth.users creation, leaves orphaned auth user on rollback failure
- RPC fallback handles validation — rejected: RPC is fallback only, Edge Function is primary path

**Rationale**: Fail fast with clear error messages (400 for missing project, 409 for DNI conflict). Avoids creating auth.users row that would need cleanup on constraint violation. Mirrors validation in RPC fallback (00010).

## Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Admin Panel │────▶│ crear-vendedor   │────▶│ auth.users      │
│ (UI)        │     │ Edge Function    │     │ (Supabase Auth) │
└─────────────┘     └────────┬─────────┘     └────────┬────────┘
                             │                      │
                             ▼                      ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ Validate:        │     │ usuarios_rol    │
                    │ - proyecto exists│     │ (with proyecto_ │
                    │ - DNI unique     │     │  _id, dni)      │
                    └────────┬─────────┘     └────────┬────────┘
                             │                      │
                             ▼                      ▼
                    ┌─────────────────────────────────────────┐
                    │ audit_trigger_fn() fires on usuarios_rol│
                    │ INSERT → audit_log entry created        │
                    └─────────────────────────────────────────┘
```

Audit log flow for any of the 7 tables:
```
┌──────────┐    INSERT/UPDATE/DELETE    ┌──────────────────┐
│ Business │ ─────────────────────────▶ │ audit_trigger_fn │
│ Table    │                            │ (SECURITY DEFINER)│
│ (lotes,  │                            │                  │
│ proyectos,│                           │ 1. Extract actor │
│ etc.)    │                            │    from JWT      │
└──────────┘                            │ 2. Build JSONB   │
                                       │    diff (OLD/NEW)│
                                       │ 3. Insert into   │
                                       │    audit_log     │
                                       └────────┬─────────┘
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │ audit_log table  │
                                       │ (RLS: admin read,│
                                       │  service_role RW)│
                                       └──────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00011_audit_log_table.sql` | Create | audit_log table, audit_actor_tipo enum, 3 indexes, RLS policies |
| `supabase/migrations/00012_audit_log_triggers.sql` | Create | audit_trigger_fn() SECURITY DEFINER + 7 triggers (lotes, proyectos, leads, transacciones, usuarios_rol, vendedores_profile*, cci_validaciones*) |
| `supabase/migrations/00013_usuarios_rol_extensions.sql` | Create | Add proyecto_id (FK), dni columns, partial unique index, 2 indexes |
| `supabase/functions/crear-vendedor/index.ts` | Modify | Add proyecto_id/dni validation, insert new columns, 409/400 error handling |

*Conditional triggers — only created if tables exist (idempotent).

## Interfaces / Contracts

### audit_log Row Shape
```typescript
interface AuditLogEntry {
  id: number;                    // BIGSERIAL
  tabla: string;                 // Source table name
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  actor_id: string | null;       // UUID from auth.uid()
  actor_tipo: 'admin' | 'asesor' | 'system' | 'edge_function';
  valores_anteriores: Record<string, unknown> | null;  // JSONB
  valores_nuevos: Record<string, unknown> | null;      // JSONB
  metadatos: Record<string, unknown>;                  // JSONB (request_id, ip, user_agent)
  created_at: string;            // ISO 8601 timestamptz
}
```

### crear-vendedor Edge Function Payload (Extended)
```typescript
interface CrearVendedorPayload {
  email: string;
  password: string;        // 8-72 chars
  nombre: string;
  rol?: 'admin' | 'vendedor' | 'comprador';  // default: 'vendedor'
  telefono?: string;       // E.164 format (+51987654321)
  proyectoId?: string;     // UUID, must exist in proyectos
  dni?: string;            // 8 digits, unique per proyectoId
}
```

### Error Responses
```typescript
// 400 Bad Request
{ error: { message: "Proyecto no encontrado", code: "proyecto_not_found" } }
{ error: { message: "proyectoId debe ser un UUID", code: "invalid_proyecto" } }

// 409 Conflict
{ error: { message: "DNI ya registrado en este proyecto", code: "dni_conflict" } }

// 422 Unprocessable Entity
{ error: { message: "DNI requerido para rol vendedor", code: "dni_required" } }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | audit_trigger_fn() logic | Direct SQL calls in test transaction: INSERT/UPDATE/DELETE on lotes → verify audit_log row |
| Unit | Partial unique index | Insert two vendedores same proyecto_id + dni → expect unique violation; different proyecto_id → succeed |
| Integration | crear-vendedor Edge Function | POST with valid payload → 200 + usuarios_rol row with proyecto_id/dni; POST with duplicate DNI → 409; POST with invalid proyectoId → 400 |
| Integration | Realtime subscription | Supabase client subscribes to audit_log → INSERT on lotes → event received within 2s |
| E2E | Admin panel audit log view | Playwright: login as admin → navigate to Audit Log → verify entries appear after CRUD operations |

## Migration / Rollout

### Rollback Plan

Each migration includes a rollback comment header:

1. **00011**: `DROP TABLE IF EXISTS public.audit_log CASCADE; DROP TYPE IF EXISTS public.audit_actor_tipo;`
2. **00012**: `DROP TRIGGER ... ON ...; DROP FUNCTION IF EXISTS public.audit_trigger_fn();`
3. **00013**: `DROP INDEX IF EXISTS uq_usuarios_rol_proyecto_dni; ALTER TABLE ... DROP COLUMN proyecto_id, DROP COLUMN dni;`

### Deployment Order

1. Apply 00011 (table + indexes + RLS)
2. Apply 00012 (trigger function + 7 triggers)
3. Apply 00013 (column additions + constraints)
4. Deploy updated Edge Function (`crear-vendedor`)

### Feature Flag

No feature flag needed — migrations are additive (nullable columns, new table). Existing code continues working:
- `usuarios_rol` existing rows have NULL proyecto_id/dni → valid
- `audit_log` only written by triggers → no app code changes needed
- Edge Function validates new fields before use

## Open Questions

- [ ] Should `audit_log` have a retention policy (e.g., auto-delete after 2 years)? Current spec doesn't require it.
- [ ] Should `vendedores_profile` and `cci_validaciones` tables be created in this PR or a future one? Triggers are conditional (IF EXISTS).
- [ ] Does the admin panel need pagination for audit_log (large tables)? Spec mentions CSV export but not pagination API.
- [ ] Should `actor_tipo` include 'comprador' as separate from 'asesor'? Current enum groups vendedor/comprador as 'asesor'.