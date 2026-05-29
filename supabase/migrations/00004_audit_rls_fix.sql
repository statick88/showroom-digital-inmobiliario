-- Audit-driven RLS fixes
-- C-01: propiedades_select_all must filter by publicada = true

drop policy if exists "propiedades_select_all" on public.propiedades;

create policy "propiedades_select_all" on public.propiedades
  for select
  using (publicada = true);
