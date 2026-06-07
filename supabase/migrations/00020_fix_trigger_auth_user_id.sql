-- =============================================================================
-- FIX: Actualizar trigger para NO fallar cuando no exista auth.user
-- =============================================================================
-- Ahora que auth_user_id es nullable, el trigger debe:
-- 1. Intentar buscar auth.user por email (si existe)
-- 2. Si no existe, dejar auth_user_id como NULL (permitir seed sin Auth)
-- 3. No lanzar excepción, para que el seed.sql funcione sin Auth
-- =============================================================================

create or replace function public.set_auth_user_id_from_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid;
begin
  if NEW.auth_user_id is null and NEW.email is not null then
    select u.id into v_auth_user_id
    from auth.users u
    where lower(u.email) = lower(NEW.email)
    limit 1;

    if v_auth_user_id is not null then
      NEW.auth_user_id := v_auth_user_id;
    end if;
    -- Si no lo encuentra, deja auth_user_id como NULL (permitido)
  end if;

  return NEW;
end;
$$;

-- Reemplazar trigger
drop trigger if exists trg_set_auth_user_id_from_email on public.usuarios_rol;

create trigger trg_set_auth_user_id_from_email
before insert on public.usuarios_rol
for each row
execute function public.set_auth_user_id_from_email();
