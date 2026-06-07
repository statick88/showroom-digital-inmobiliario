# PR-5 Change Proposal: Admin Audit Log + Vendedor Management (HU-009)

## 📋 Intent & Scope

Complete the remaining database layer work for PR-5 to make the already-implemented admin audit log and vendedor management features fully functional. The UI components, hooks, repositories, Edge Functions, and tests are all complete — only the Supabase database schema (migrations + triggers) is missing.

**Branch**: `feature/pr-5-admin-audit`  
**Related**: PR-4 (vendedor panel + transactions) merged, Stitch migration archived

---

## ✅ Current State Summary

| Component                            | Status  | Notes                                                           |
| ------------------------------------ | ------- | --------------------------------------------------------------- |
| **Admin Enhanced Spec (8 REQs)**     | ✅ Done | All REQ-AE-01 through REQ-AE-08 implemented in `AdminDashboard` |
| **AuditLogPanel**                    | ✅ Done | Filters, pagination, diff, realtime, CSV export                 |
| **UsuariosPanel (T-5.1)**            | ✅ Done | Table, pagination, create/edit/delete wiring                    |
| **CrearVendedorDialog (T-5.2)**      | ✅ Done | Zod validation, Edge Function + RPC fallback                    |
| **EditarVendedorDialog (T-5.3)**     | ✅ Done | Edit + desactivar action                                        |
| **Hooks (useAuditLog, useUsuarios)** | ✅ Done | TanStack Query + realtime                                       |
| **Repositories**                     | ✅ Done | Full CRUD + Edge Function integration                           |
| **Edge Function: crear-vendedor**    | ✅ Done | Admin check + service-role auth                                 |
| **RPC Fallback: crear_vendedor**     | ✅ Done | Migration 00010                                                 |
| **Tests**                            | ✅ Done | Comprehensive coverage for all above                            |

---

## ❌ Missing Database Layer (This Proposal)

### 1. `audit_log` Table + Triggers (Critical)

The `audit_log` table is referenced everywhere but **does not exist** in any migration. Need:

- Table creation migration
- Triggers on all DML tables (`propiedades`, `lotes`, `usuarios_rol`, `transacciones`, `leads`, `metricas_clicks`, `proyectos`)
- Trigger function capturing: `tabla`, `accion`, `actor`, `actor_rol`, `registro_id`, `valores_antiguos`, `valores_nuevos`

### 2. `proyectoId` Column on `usuarios_rol` (Required for HU-007)

- Entity `VendedorProfile` has `proyectoId?: string` (optional)
- DB table `usuarios_rol` **missing** this column
- Referenced in `crearVendedorSchema`, `CrearVendedorDialog`, `EditarVendedorDialog`
- Needed for lot scoping by vendedor (HU-007)

### 3. `dni` Column on `usuarios_rol` (Required by Schema)

- `crearVendedorSchema` requires `dni` (8 digits, Peru national ID)
- DB table `usuarios_rol` **missing** this column
- Used in `CrearVendedorDialog` but not persisted

---

## 🎯 Approach

### Phase 1: Database Migrations (Sequential)

Create 3 new migrations in order:

1. **`00011_audit_log_table.sql`** — Create `audit_log` table with indexes
2. **`00012_audit_log_triggers.sql`** — Create trigger function + attach to all tables
3. **`00013_usuarios_rol_extensions.sql`** — Add `proyecto_id` + `dni` columns to `usuarios_rol`

### Phase 2: Verify Integration

- Run existing tests against local Supabase with new migrations
- Verify `AuditLogPanel` populates data via triggers
- Verify `CrearVendedorDialog` persists `dni` and `proyectoId`
- Verify `EditarVendedorDialog` can edit `proyectoId`

### Phase 3: Edge Function Deploy (Optional)

- Deploy `crear-vendedor` Edge Function to Supabase project
- Verify production path works (currently only RPC fallback tested)

---

## 📦 Affected Specs

| Spec                                    | Action        | Reason                                     |
| --------------------------------------- | ------------- | ------------------------------------------ |
| `openspec/specs/admin-enhanced/spec.md` | **No change** | All 8 REQs already implemented             |
| `openspec/specs/design-tokens/spec.md`  | **No change** | DESIGN.md already complete                 |
| **New: `audit-log` spec**               | **Create**    | Document audit log requirements separately |
| **New: `vendedor-management` spec**     | **Create**    | Document HU-009 requirements separately    |

> The existing `admin-enhanced` spec covers dashboard UI only. Audit log and vendedor management are separate concerns that should have their own delta specs for traceability.

---

## 📊 Delivery Forecast

| Work Item                                | Est. Lines Changed | Complexity | Chained PR?        |
| ---------------------------------------- | ------------------ | ---------- | ------------------ |
| Migration 00011: audit_log table         | ~80                | Low        | No                 |
| Migration 00012: audit_log triggers      | ~150               | Medium     | No                 |
| Migration 00013: usuarios_rol extensions | ~60                | Low        | No                 |
| Test updates (if needed)                 | ~50                | Low        | No                 |
| **Total**                                | **~340**           | **Medium** | **No — single PR** |

**Recommendation**: Single PR (not chained). All migrations are related database changes for the same feature set. Total < 400 lines, well under chained-PR threshold.

---

## 🔗 Dependencies

### Internal

- PR-4 merged (provides `usuarios_rol` table, `usuariosRepository`, `useUsuarios` hooks)
- DESIGN.md tokens (status colors used in AuditLogPanel badges)

### External

- **Supabase project** with:
  - `pgcrypto` extension (for `crypt()` in RPC) — already enabled
  - Edge Functions enabled (for `crear-vendedor` production path) — optional, RPC fallback exists
  - Realtime enabled (for `useRealtimeAuditLog`) — already working

### Migration Order Dependency

```
00011_audit_log_table.sql
    ↓
00012_audit_log_triggers.sql (depends on 00011)
    ↓
00013_usuarios_rol_extensions.sql (independent, can run anytime after 00005)
```

---

## ✅ Acceptance Criteria

1. **Audit Log Functional**
   - `AuditLogPanel` shows real data from `audit_log` table
   - Triggers fire on INSERT/UPDATE/DELETE on all core tables
   - Realtime updates work (new rows appear without refresh)
   - CSV export includes all columns including diffs

2. **Vendedor Management Complete**
   - `CrearVendedorDialog` persists `dni` and `proyectoId` to `usuarios_rol`
   - `EditarVendedorDialog` can update `proyectoId`
   - `UsuariosPanel` shows `proyectoId` column (optional enhancement)

3. **Tests Pass**
   - All existing tests pass with new migrations applied
   - No regression in PR-4 functionality

4. **Migrations Idempotent**
   - Can run `supabase db reset` cleanly
   - No conflicts with existing migrations

---

## 🚀 Next Steps

1. **Approve this proposal** → Proceed to `sdd-spec` phase to write delta specs for:
   - `audit-log` specification (triggers, schema, realtime)
   - `vendedor-management` database extensions (proyectoId, dni)

2. **Orchestrator** → Launch `sdd-spec` for the two new specs

3. **Implementation** → `sdd-apply` will create the 3 migrations + any test updates

---

_Generated from exploration on feature/pr-5-admin-audit branch. All UI/components/hooks/tests already complete — only database layer remaining._
