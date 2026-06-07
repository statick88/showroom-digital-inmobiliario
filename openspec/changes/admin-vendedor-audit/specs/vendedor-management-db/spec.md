# Vendedor Management DB Specification (Delta)

## Purpose

Delta spec for `usuarios_rol` table extensions: `proyecto_id` (FK to proyectos), `dni` (unique per proyecto), and updates to `crear-vendedor` Edge Function.

## ADDED Requirements

### REQ-VM-01: Add proyecto_id Column to usuarios_rol

The system MUST add `proyecto_id UUID REFERENCES proyectos(id)` column to `usuarios_rol` table.

#### Scenario: Column added with FK constraint

- GIVEN migration `00013_usuarios_rol_extensions.sql` runs
- THEN `usuarios_rol` MUST have column `proyecto_id` UUID
- AND FK constraint `fk_usuarios_rol_proyecto` MUST reference `proyectos(id)`
- AND existing rows MUST have `proyecto_id` = NULL (nullable for backward compat)

### REQ-VM-02: Add dni Column to usuarios_rol

The system MUST add `dni VARCHAR(20)` column to `usuarios_rol` table (required for `crear-vendedor` Edge Function).

#### Scenario: Column added with correct type

- GIVEN migration `00013_usuarios_rol_extensions.sql` runs
- THEN `usuarios_rol` MUST have column `dni` VARCHAR(20)
- AND existing rows MUST have `dni` = NULL (nullable for backward compat)

### REQ-VM-03: Unique Constraint on (proyecto_id, dni)

The system MUST enforce unique DNI per project via composite unique constraint.

#### Scenario: Duplicate DNI in same project rejected

- GIVEN two vendedores in same proyecto_id
- WHEN INSERT second vendedor with same dni
- THEN INSERT MUST fail with unique violation
- AND error MUST reference constraint `uq_usuarios_rol_proyecto_dni`

#### Scenario: Same DNI in different projects allowed

- GIVEN vendedor in proyecto_A with dni '12345678'
- WHEN INSERT vendedor in proyecto_B with dni '12345678'
- THEN INSERT MUST succeed

### REQ-VM-04: Update crear-vendedor Edge Function

The `crear-vendedor` Edge Function MUST handle new columns `proyecto_id` and `dni`.

#### Scenario: Edge Function accepts and stores new fields

- GIVEN POST to /functions/v1/crear-vendedor with body containing proyecto_id and dni
- THEN function MUST insert into `usuarios_rol` with both fields
- AND response MUST include created record with proyecto_id and dni

#### Scenario: Edge Function validates dni uniqueness

- GIVEN POST with dni already used in same proyecto_id
- THEN function MUST return 409 Conflict
- AND error message MUST indicate "DNI ya registrado en este proyecto"

#### Scenario: Edge Function validates proyecto_id exists

- GIVEN POST with non-existent proyecto_id
- THEN function MUST return 400 Bad Request
- AND error message MUST indicate "Proyecto no encontrado"

## MODIFIED Requirements

### REQ-VM-05: usuarios_rol Table — Existing Rows Migration Compatibility

Existing `usuarios_rol` rows MUST remain valid after migration (nullable columns, no data loss).

(Previously: usuarios_rol had no proyecto_id or dni columns)

#### Scenario: Pre-migration rows accessible

- GIVEN usuarios_rol has existing rows before migration
- WHEN migration `00013_usuarios_rol_extensions.sql` runs
- THEN all existing rows MUST be preserved
- AND new columns MUST be NULL for existing rows
- AND application MUST NOT crash on NULL proyecto_id/dni

#### Scenario: New rows require dni when rol = 'vendedor'

- GIVEN INSERT into usuarios_rol with rol = 'vendedor'
- WHEN dni is NULL
- THEN INSERT MUST fail (application-level validation)
- AND error MUST indicate "DNI requerido para rol vendedor"

## REMOVED Requirements

None.

## RENAMED Requirements

None.