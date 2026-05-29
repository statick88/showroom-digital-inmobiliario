-- Fix: explicit search_path on functions (Supabase lint: function_search_path_mutable)

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.obtener_top_clicks(p_agencia_id uuid, p_limite int default 10)
returns table (
  id uuid, codigo text, titulo text,
  tipo public.tipo_propiedad, estado public.estado_propiedad,
  precio numeric(12,2), distrito text, created_at timestamptz,
  total_clicks bigint
)
language sql
stable
set search_path = ''
as $$
  select
    p.id, p.codigo, p.titulo, p.tipo, p.estado, p.precio, p.distrito, p.created_at,
    count(mc.id)::bigint as total_clicks
  from public.propiedades p
  left join public.metricas_clicks mc on mc.propiedad_id = p.id
  where p.agencia_id = p_agencia_id
  group by p.id
  order by total_clicks desc
  limit p_limite;
$$;

create or replace function public.obtener_metricas_dashboard(p_agencia_id uuid)
returns table (
  total_propiedades bigint, disponibles bigint, separadas bigint,
  vendidas bigint, total_clicks bigint, total_leads bigint, avance_porcentaje numeric
)
language sql
stable
set search_path = ''
as $$
  select
    count(*)::bigint as total_propiedades,
    count(*) filter (where estado = 'disponible')::bigint as disponibles,
    count(*) filter (where estado = 'separado')::bigint as separadas,
    count(*) filter (where estado = 'vendido')::bigint as vendidas,
    coalesce((select count(*) from public.metricas_clicks mc join public.propiedades p on mc.propiedad_id = p.id where p.agencia_id = p_agencia_id), 0)::bigint as total_clicks,
    coalesce((select count(*) from public.leads l join public.propiedades p on l.propiedad_id = p.id where p.agencia_id = p_agencia_id), 0)::bigint as total_leads,
    case
      when count(*) > 0 then
        round(((count(*) filter (where estado in ('separado', 'vendido')))::numeric / count(*)::numeric) * 100, 1)
      else 0
    end as avance_porcentaje
  from public.propiedades
  where agencia_id = p_agencia_id;
$$;
