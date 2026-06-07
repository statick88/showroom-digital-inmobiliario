# Audit Log Specification (Delta)

## Purpose

Delta spec for database audit layer: `audit_log` table, trigger function `audit_trigger_fn()`, triggers on 7 tables, realtime subscription for admin panel, and CSV export compatibility.

## ADDED Requirements

### REQ-AL-01: Audit Log Table Structure

The system MUST provide an `audit_log` table with the following columns:
- `id` BIGSERIAL PRIMARY KEY
- `tabla` TEXT NOT NULL — source table name
- `accion` TEXT NOT NULL — INSERT | UPDATE | DELETE
- `actor_id` UUID — authenticated user ID (nullable for system actions)
- `actor_tipo` TEXT — 'admin' | 'asesor' | 'system' | 'edge_function'
- `valores_anteriores` JSONB — full row before change (null for INSERT)
- `valores_nuevos` JSONB — full row after change (null for DELETE)
- `metadatos` JSONB — additional context (ip, user_agent, request_id, etc.)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

#### Scenario: Table created with all columns

- GIVEN migration `00011_audit_log_table.sql` runs
- THEN table `audit_log` MUST exist with all 8 columns
- AND `id` MUST be BIGSERIAL PRIMARY KEY
- AND `created_at` MUST have DEFAULT now()
- AND `valores_anteriores` and `valores_nuevos` MUST be JSONB type

### REQ-AL-02: Audit Log Indexes

The system MUST create indexes for query performance:
- `idx_audit_log_tabla_accion` ON `audit_log` (`tabla`, `accion`)
- `idx_audit_log_actor_created` ON `audit_log` (`actor_id`, `created_at`)
- `idx_audit_log_tabla_created` ON `audit_log` (`tabla`, `created_at`)

#### Scenario: Indexes created and usable

- GIVEN migration `00011_audit_log_table.sql` runs
- THEN all 3 indexes MUST exist
- AND query `SELECT * FROM audit_log WHERE tabla = 'lotes' AND accion = 'UPDATE'` MUST use `idx_audit_log_tabla_accion`
- AND query `SELECT * FROM audit_log WHERE actor_id = 'uuid' ORDER BY created_at DESC` MUST use `idx_audit_log_actor_created`

### REQ-AL-03: Audit Trigger Function

The system MUST provide a trigger function `audit_trigger_fn()` that:
- Captures INSERT, UPDATE, DELETE operations
- Computes JSONB diff: `valores_anteriores` (OLD row) and `valores_nuevos` (NEW row)
- Extracts `actor_id` and `actor_tipo` from `request.jwt.claims` (or defaults to 'system')
- Records `metadatos` with `request_id`, `ip`, `user_agent` when available
- Returns NEW for INSERT/UPDATE, OLD for DELETE

#### Scenario: INSERT captured correctly

- GIVEN trigger attached to `lotes` table
- WHEN INSERT INTO lotes (code, title) VALUES ('LT-001', 'Test')
- THEN audit_log MUST have 1 row
- AND `accion` = 'INSERT'
- AND `valores_anteriores` IS NULL
- AND `valores_nuevos` CONTAINS {"code": "LT-001", "title": "Test"}
- AND `tabla` = 'lotes'

#### Scenario: UPDATE captured with diff

- GIVEN lotes row exists with `status` = 'disponible'
- WHEN UPDATE lotes SET status = 'separado' WHERE code = 'LT-001'
- THEN audit_log MUST have 1 row
- AND `accion` = 'UPDATE'
- AND `valores_anteriores` CONTAINS {"status": "disponible"}
- AND `valores_nuevos` CONTAINS {"status": "separado"}

#### Scenario: DELETE captured correctly

- GIVEN lotes row exists with code 'LT-001'
- WHEN DELETE FROM lotes WHERE code = 'LT-001'
- THEN audit_log MUST have 1 row
- AND `accion` = 'DELETE'
- AND `valores_anteriores` CONTAINS {"code": "LT-001"}
- AND `valores_nuevos` IS NULL

#### Scenario: Actor context extracted from JWT

- GIVEN authenticated admin with user_id 'uuid-123' performs UPDATE
- WHEN trigger fires
- THEN `actor_id` = 'uuid-123'
- AND `actor_tipo` = 'admin'

### REQ-AL-04: Triggers on 7 Tables

The system MUST attach `audit_trigger_fn()` to the following tables:
- `lotes`
- `proyectos`
- `leads`
- `transacciones`
- `usuarios_rol`
- `vendedores_profile`
- `cci_validaciones`

Each trigger MUST fire AFTER INSERT OR UPDATE OR DELETE FOR EACH ROW.

#### Scenario: All 7 triggers created

- GIVEN migration `00012_audit_log_triggers.sql` runs
- THEN 7 triggers MUST exist (one per table)
- AND each trigger MUST be named `audit_trigger_{table}`
- AND each trigger MUST fire AFTER INSERT OR UPDATE OR DELETE

### REQ-AL-05: Realtime Subscription for Admin Panel

The system MUST support Supabase Realtime subscription on `audit_log` for admin panel live updates.

#### Scenario: Admin panel receives realtime audit events

- GIVEN admin panel subscribes to `postgres_changes` on `audit_log`
- WHEN INSERT occurs on `lotes` table
- THEN admin panel MUST receive event within 2 seconds
- AND event payload MUST include `tabla`, `accion`, `valores_nuevos`, `created_at`

### REQ-AL-06: CSV Export Compatibility (PapaParse)

The system MUST ensure `audit_log` data is exportable via PapaParse with:
- UTF-8 encoding
- Headers matching column names
- JSONB columns serialized as valid JSON strings
- `created_at` in ISO 8601 format

#### Scenario: CSV export produces valid PapaParse output

- GIVEN admin panel exports audit_log to CSV
- WHEN PapaParse parses the CSV
- THEN no parsing errors MUST occur
- AND each row MUST have 8 columns
- AND `valores_anteriores` and `valores_nuevos` MUST be valid JSON strings
- AND `created_at` MUST be parseable by `new Date()`

## REMOVED Requirements

None — this is a new capability.

## RENAMED Requirements

None — this is a new capability.