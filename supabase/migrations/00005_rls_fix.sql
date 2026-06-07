-- Fix Supabase lint warnings
-- 1. rls_policy_always_true: add WITH CHECK validation
-- 2. anon/authenticated_security_definer_function_executable: revoke public access on Supabase internal function

-- metricas_clicks: allow public insert but validate propiedad_id is present
drop policy if exists "metricas_insert_all" on public.metricas_clicks;
create policy "metricas_insert_all" on public.metricas_clicks
  for insert with check (
    propiedad_id is not null
  );

-- leads: allow public insert but validate required fields are non-empty
drop policy if exists "leads_insert_all" on public.leads;
create policy "leads_insert_all" on public.leads
  for insert with check (
    nombre <> ''
    and email <> ''
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- rls_auto_enable is a Supabase internal event trigger function
-- Revoke EXECUTE from PUBLIC (which includes anon + authenticated)
-- NOTE: Function may not exist in all Supabase versions - using DO block for safety
do $$
begin
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    revoke execute on function public.rls_auto_enable() from public;
  end if;
end $$;
