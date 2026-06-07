# Proposal: Admin Vendedor Audit

## Intent

Add database audit logging and vendedor management validation to the Showroom Digital Inmobiliario platform. Track all CRUD operations on core business tables and enforce DNI uniqueness per project when creating vendedores.

## Scope

### In Scope
- `audit_log` table with JSONB diff storage and RLS policies
- `audit_trigger_fn()` SECURITY DEFINER trigger function capturing actor context from JWT
- Triggers on 7 tables: lotes, proyectos, leads, transacciones, usuarios_rol, vendedores_profile (conditional), cci_validaciones (conditional)
- `usuarios_rol` extensions: `proyecto_id` UUID FK, `dni` VARCHAR(20), partial unique index `(proyecto_id, dni) WHERE proyecto_id IS NOT NULL AND dni IS NOT NULL`
- `crear-vendedor` Edge Function validation for `proyectoId` existence (400), DNI conflict per project (409), and DNI required for vendedor role (422)
- Admin panel realtime subscription and CSV export for audit log

### Non-Goals
- No application-level audit middleware (DB triggers chosen for completeness)
- No feature flag (additive migrations, nullable columns)
- No UI changes (components already implemented)
- No pagination API for audit log (spec defers to future)
- `vendedores_profile` and `cci_validaciones` table creation (if absent, triggers skip via conditional blocks)

## Approach

Three sequential migrations followed by Edge Function update, aligned with existing patterns in `supabase/migrations/`:

1. `00013_audit_log_table.sql` — table, enum, 3 indexes, RLS
2. `00014_audit_log_triggers.sql` — SECURITY DEFINER function + 7 triggers
3. `00015_usuarios_rol_extensions.sql` — new columns, FK, partial unique index

Edge Function (`crear-vendedor`) updated to validate new fields before `auth.admin.createUser`.

## References

- Specs: `openspec/changes/admin-vendedor-audit/specs/audit-log/spec.md` (REQ-AL-01..06), `openspec/changes/admin-vendedor-audit/specs/vendedor-management-db/spec.md` (REQ-VM-01..05)
- Design: `openspec/changes/admin-vendedor-audit/design.md`

## Risks

- Local Supabase vector container failure blocks runtime verification (Colima Docker socket issue)
- Pre-existing TypeScript errors in test files (unrelated)
- Pre-existing LeadForm toast test failure (unrelated)

## Next Steps

- Complete proposal → generate specs (delta) → create design.md → break into tasks
- Implementation: apply migrations, deploy Edge Function, verify runtime behavior against cloud Supabase instance
