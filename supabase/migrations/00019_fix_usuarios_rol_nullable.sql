-- =============================================================================
-- FIX: Hacer auth_user_id nullable en usuarios_rol
-- =============================================================================
-- Motivo: el seed inserta datos de prueba sin crear usuarios en auth.users.
-- Si necesitás vincular a un usuario real, hacerlo por email con el trigger
-- set_auth_user_id_from_email (ya existente en la base).
-- =============================================================================

alter table public.usuarios_rol alter column auth_user_id drop not null;
