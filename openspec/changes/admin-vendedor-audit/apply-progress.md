# Apply Progress — admin-vendedor-audit (PR-5)

**Date**: 2026-06-06
**Mode**: Standard (Strict TDD not applicable — migrations and Edge Function are database/infrastructure code)
**Change**: admin-vendedor-audit

## Completed Tasks

### Phase 1: Database Migrations ✅

| Task | Migration | Status | Notes |
|------|-----------|--------|-------|
| T-5.1 | 00013_audit_log_table.sql | ✅ Applied | Creates audit_log table, audit_actor_tipo enum, 3 indexes, RLS policies |
| T-5.2 | 00014_audit_log_triggers.sql | ✅ Applied | Creates audit_trigger_fn() SECURITY DEFINER + 7 triggers |
| T-5.3 | 00015_usuarios_rol_extensions.sql | ✅ Applied | Adds proyecto_id (FK), dni, partial unique index |

**Migration Fixes Applied**:
- Renumbered all migrations 00001-00015 to resolve duplicate version conflicts
- Fixed function return type conflict in 00004_search_path_fix.sql (obtener_metricas_dashboard)
- Fixed rls_auto_enable() check in 00005_rls_fix.sql with DO block
- Added PostGIS extension in 00001_schema.sql for geometry type
- Fixed default project creation in 00008_lotizacion_schema.sql (no longer depends on seed data)
- Fixed `comment on index` syntax in 00015_usuarios_rol_extensions.sql

### Phase 2: Edge Function ✅

| Task | File | Status | Notes |
|------|------|--------|-------|
| T-5.4 | supabase/functions/crear-vendedor/index.ts | ✅ Updated & Formatted | Added proyecto_id/dni validation, 409/400 error handling, formatted with Prettier |

### Phase 3: Integration & Verification ⏳

| Task | Status | Notes |
|------|--------|-------|
| T-5.5 Verify triggers | ⏳ PENDING | Requires running Supabase stack (blocked by vector container issue) |
| T-5.6 Verify realtime | ⏳ PENDING | Requires running Supabase stack |
| T-5.7 Verify CSV export | ⏳ PENDING | Requires running Supabase stack |
| T-5.8 Full test suite | ⚠️ PARTIAL | Build + Lint PASS; Typecheck has pre-existing test file errors; 1 pre-existing test failure |

## Quality Gates

| Gate | Status | Details |
|------|--------|---------|
| **Build** | ✅ PASS | `pnpm build` — 321ms, no errors |
| **Lint** | ✅ PASS | `pnpm lint` — 0 errors, 100 warnings (pre-existing) |
| **Typecheck** | ⚠️ PARTIAL | 8 errors in test files (pre-existing, not in source) |
| **Tests** | ⚠️ PARTIAL | 567 pass, 1 fail (pre-existing LeadForm toast test), 3 test files with pre-existing issues |

## Known Issues / Blockers

1. **Local Supabase vector container failure**: Colima Docker socket mount issue (`/Users/statick/.colima/default/docker.sock`) causes containers to be pruned after migrations apply. Migrations 00013-00015 were applied successfully during `supabase start` but database volume was pruned.

2. **Pre-existing TypeScript errors**: In test files only:
   - `supabase-audit-log.pagination.test.ts`: Mock typing issues
   - `AuditLogPanel.test.tsx`: `hasPopup` property, possibly undefined objects

3. **Pre-existing test failure**: `LeadForm.test.tsx` — toast timing assertion

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00001_schema.sql` | Modified | Added PostGIS extension |
| `supabase/migrations/00004_search_path_fix.sql` | Modified | Fixed obtener_metricas_dashboard return type |
| `supabase/migrations/00005_rls_fix.sql` | Modified | Safe rls_auto_enable() revoke |
| `supabase/migrations/00008_lotizacion_schema.sql` | Modified | Default project creation without seed dependency |
| `supabase/migrations/00013_audit_log_table.sql` | Created | Audit log table (renumbered from 00011) |
| `supabase/migrations/00014_audit_log_triggers.sql` | Created | Trigger function + 7 triggers (renumbered from 00012) |
| `supabase/migrations/00015_usuarios_rol_extensions.sql` | Created | usuarios_rol extensions (renumbered from 00013) |
| `supabase/functions/crear-vendedor/index.ts` | Modified | Added proyecto_id/dni validation, formatted |
| `openspec/changes/admin-vendedor-audit/tasks.md` | Modified | Updated task statuses |

## Next Steps

1. Deploy migrations to linked Supabase project: `supabase db push`
2. Deploy Edge Function: `supabase functions deploy crear-vendedor`
3. Verify triggers, realtime, and CSV export against running database
4. Fix pre-existing TypeScript errors in test files (separate task)