-- ============================================================
-- FIX: usuarios_rol RLS infinite recursion
-- ============================================================
-- Problem: The policy "usuarios_rol_select_own" queries usuarios_rol
-- to check if the user is admin, which triggers the same policy,
-- creating an infinite loop.
--
-- Solution: Create a SECURITY DEFINER function that bypasses RLS
-- to get the current user's role, then use it in policies.
-- ============================================================

-- 1. Create helper function to get current user's role (bypasses RLS)
create or replace function public.get_current_user_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select rol::text from public.usuarios_rol where auth_user_id = auth.uid() limit 1;
$$;

-- Grant execute to authenticated users
grant execute on function public.get_current_user_role() to authenticated;

-- 2. Drop and recreate the recursive policy for usuarios_rol
drop policy if exists "usuarios_rol_select_own" on public.usuarios_rol;

create policy "usuarios_rol_select_own" on public.usuarios_rol for select using (
  auth_user_id = auth.uid()
  or public.get_current_user_role() = 'admin'
);

-- 3. Fix other policies that reference usuarios_rol directly
-- These also cause recursion when used on usuarios_rol itself,
-- but they're on OTHER tables so they're fine for now.
-- However, let's update the proyectos policies too for consistency.

-- Drop and recreate proyectos insert policy (uses usuarios_rol)
drop policy if exists "proyectos_insert_admin" on public.proyectos;
create policy "proyectos_insert_admin" on public.proyectos for insert with check (
  public.get_current_user_role() = 'admin'
);

-- Drop and recreate proyectos update policy
drop policy if exists "proyectos_update_admin" on public.proyectos;
create policy "proyectos_update_admin" on public.proyectos for update using (
  public.get_current_user_role() = 'admin'
);

-- Drop and recreate lotes insert policy
drop policy if exists "lotes_insert_admin" on public.lotes;
create policy "lotes_insert_admin" on public.lotes for insert with check (
  public.get_current_user_role() in ('admin', 'vendedor')
);

-- Drop and recreate lotes update policy
drop policy if exists "lotes_update_admin" on public.lotes;
create policy "lotes_update_admin" on public.lotes for update using (
  public.get_current_user_role() in ('admin', 'vendedor')
);

-- Drop and recreate transacciones select policy
drop policy if exists "transacciones_select_staff" on public.transacciones;
create policy "transacciones_select_staff" on public.transacciones for select using (
  public.get_current_user_role() in ('admin', 'vendedor')
);

-- Drop and recreate transacciones insert policy
drop policy if exists "transacciones_insert_admin" on public.transacciones;
create policy "transacciones_insert_admin" on public.transacciones for insert with check (
  public.get_current_user_role() = 'admin'
);

-- 4. Add comment
comment on function public.get_current_user_role() is 
  'SECURITY DEFINER function to get current user role. Used in RLS policies to avoid infinite recursion on usuarios_rol table.';
