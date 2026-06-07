-- ============================================================
-- SHOWROOM LOTIZACIÓN — Migración de datos legacy
-- ============================================================
-- IDEMPOTENTE: puede ejecutarse múltiples veces sin duplicar datos.
-- Preserva UUIDs originales de propiedades para mantener trazabilidad
-- con leads (vía propiedad_id) y migra leads históricos a transacciones.

-- 1. Migrar propiedades (tipo=lote|terreno) → lotes
-- Preserva el UUID original de propiedades como id del lote para
-- mantener la relación con leads.propiedad_id y otros referentes.
do $$
declare
  v_proyecto_id uuid;
begin
  select id into v_proyecto_id from public.proyectos limit 1;

  if v_proyecto_id is null then
    raise exception 'No se encontró un proyecto default. Ejecutar 00005_lotizacion_schema primero.';
  end if;

  insert into public.lotes (
    id, proyecto_id, codigo, area_total, frente, fondo,
    precio, moneda, estado, poligono_coords,
    descripcion, orden, created_at, updated_at
  )
  select
    p.id,
    v_proyecto_id,
    p.codigo,
    coalesce(p.area_m2, 0),
    null,
    null,
    p.precio,
    p.moneda,
    case p.estado
      when 'disponible' then 'disponible'::public.estado_lote
      when 'separado'  then 'reservado'::public.estado_lote
      when 'vendido'   then 'vendido'::public.estado_lote
      else 'disponible'::public.estado_lote
    end,
    case
      when p.ubicacion is not null then
        jsonb_build_array(
          jsonb_build_array(
            jsonb_build_array(ST_X(p.ubicacion::geometry) - 0.0005, ST_Y(p.ubicacion::geometry) - 0.0005),
            jsonb_build_array(ST_X(p.ubicacion::geometry) + 0.0005, ST_Y(p.ubicacion::geometry) - 0.0005),
            jsonb_build_array(ST_X(p.ubicacion::geometry) + 0.0005, ST_Y(p.ubicacion::geometry) + 0.0005),
            jsonb_build_array(ST_X(p.ubicacion::geometry) - 0.0005, ST_Y(p.ubicacion::geometry) + 0.0005),
            jsonb_build_array(ST_X(p.ubicacion::geometry) - 0.0005, ST_Y(p.ubicacion::geometry) - 0.0005)
          )
        )
      else
        '[[[-74.2, -13.2], [-74.19, -13.2], [-74.19, -13.19], [-74.2, -13.19], [-74.2, -13.2]]]'::jsonb
    end,
    coalesce(p.descripcion, ''),
    row_number() over (order by p.created_at),
    p.created_at,
    p.updated_at
  from public.propiedades p
  where p.tipo in ('lote', 'terreno')
  on conflict (id) do nothing;

  raise notice 'Migración de lotes legacy completada.';
end $$;

-- 2. Migrar leads históricos → transacciones
-- Solo leads con estado calificado (→ reserva) o ganado (→ venta)
-- que tengan un lote destino (match por UUID preservado).
do $$
declare
  v_count integer;
begin
  insert into public.transacciones (
    lote_id, tipo, comprador_nombre, comprador_email, comprador_telefono,
    monto, moneda, notas, created_at, updated_at
  )
  select
    l.id,
    case
      when le.estado = 'ganado' then 'venta'::public.tipo_transaccion
      else 'reserva'::public.tipo_transaccion
    end,
    le.nombre,
    le.email,
    le.telefono,
    coalesce(l.precio, 0),
    l.moneda,
    le.notas,
    le.created_at,
    le.updated_at
  from public.leads le
  join public.lotes l on l.id = le.propiedad_id
  where le.estado in ('calificado', 'ganado')
  on conflict do nothing;

  get diagnostics v_count = row_count;
  raise notice 'Migración de leads → transacciones: % registros', v_count;
end $$;

-- 3. Verificación post-migración
do $$
declare
  v_prop_lote    integer;
  v_lotes        integer;
  v_leads_val    integer;
  v_transaccs    integer;
begin
  select count(*) into v_prop_lote
  from public.propiedades
  where tipo in ('lote', 'terreno');

  select count(*) into v_lotes
  from public.lotes;

  select count(*) into v_leads_val
  from public.leads
  where estado in ('calificado', 'ganado')
    and propiedad_id in (select id from public.lotes);

  select count(*) into v_transaccs
  from public.transacciones;

  raise notice '=== VERIFICACIÓN POST-MIGRACIÓN ===';
  raise notice 'Propiedades lote/terreno origen: %', v_prop_lote;
  raise notice 'Lotes destino:                 %', v_lotes;
  raise notice 'Leads migrables (con lote):    %', v_leads_val;
  raise notice 'Transacciones destino:         %', v_transaccs;

  if v_prop_lote > 0 and v_lotes = 0 then
    raise warning 'Migración de lotes FALLÓ: % propiedades origen, 0 lotes destino', v_prop_lote;
  elsif v_prop_lote = v_lotes then
    raise notice 'Migración de lotes OK (% registros)', v_prop_lote;
  else
    raise notice 'Migración de lotes parcial: % origen → % destino (algunos ya migrados previamente)', v_prop_lote, v_lotes;
  end if;
end $$;
