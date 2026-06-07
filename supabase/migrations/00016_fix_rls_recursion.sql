-- ============================================================
-- Fix Infinite Recursion in RLS Policies
-- ============================================================
-- The policies on perfiles, propiedades, metricas_clicks, and leads
-- have infinite recursion because they query the same table they're
-- protecting within their policy conditions.
--
-- Fix: Use auth.jwt() ->> 'role' and auth.jwt() ->> 'user_metadata'
-- to check admin status without self-referencing the table.
-- ============================================================

-- 1. DROP PROBLEMATIC POLICIES
drop policy if exists "perfiles_select_own" on public.perfiles;
drop policy if exists "perfiles_insert_own" on public.perfiles;
drop policy if exists "perfiles_update_own" on public.perfiles;

drop policy if exists "propiedades_insert_agencia" on public.propiedades;
drop policy if exists "propiedades_update_agencia" on public.propiedades;
drop policy if exists "propiedades_delete_agencia" on public.propiedades;

drop policy if exists "metricas_select_agencia" on public.metricas_clicks;

drop policy if exists "leads_select_agencia" on public.leads;
drop policy if exists "leads_update_agencia" on public.leads;

-- 2. CREATE HELPER FUNCTION (SECURITY DEFINER) to check admin status
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Check if current user has admin role via JWT claim
  -- Supabase stores custom claims in user_metadata
  return (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin';
end;
$$;

-- 3. RECREATE PERFILES POLICIES (no self-reference)
-- Users can see their own profile
create policy "perfiles_select_own" on public.perfiles
  for select using (
    auth_user_id = auth.uid()
    or public.is_admin()
  );

-- Users can insert their own profile
create policy "perfiles_insert_own" on public.perfiles
  for insert with check (auth_user_id = auth.uid());

-- Users can update their own profile
create policy "perfiles_update_own" on public.perfiles
  for update using (auth_user_id = auth.uid());

-- 4. RECREATE PROPIEDADES POLICIES (use is_admin() instead of self-query)
create policy "propiedades_insert_agencia" on public.propiedades
  for insert with check (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "propiedades_update_agencia" on public.propiedades
  for update using (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "propiedades_delete_agencia" on public.propiedades
  for delete using (
    agencia_id in (
      select agencia_id from public.perfiles where auth_user_id = auth.uid()
    )
    or public.is_admin()
  );

-- 5. RECREATE METRICAS POLICIES
create policy "metricas_select_agencia" on public.metricas_clicks
  for select using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or public.is_admin()
  );

-- 6. RECREATE LEADS POLICIES
create policy "leads_select_agencia" on public.leads
  for select using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or public.is_admin()
  );

create policy "leads_update_agencia" on public.leads
  for update using (
    propiedad_id in (
      select id from public.propiedades
      where agencia_id in (
        select agencia_id from public.perfiles where auth_user_id = auth.uid()
      )
    )
    or public.is_admin()
  );

-- 7. COMMENTS
comment on function public.is_admin() is
  'Security definer function to check if current user has admin role. '
  'Reads from auth.jwt() user_metadata to avoid RLS infinite recursion. '
  'Used in policies instead of self-referential queries on perfiles table.';