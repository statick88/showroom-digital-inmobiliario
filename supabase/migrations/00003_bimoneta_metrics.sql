-- ============================================================
-- SHOWROOM DIGITAL INMOBILIARIO — Bimoneta Sales Breakdown
-- ============================================================

-- Update obtener_metricas_dashboard function to include currency breakdown
DROP FUNCTION IF EXISTS public.obtener_metricas_dashboard(uuid);

CREATE OR REPLACE FUNCTION public.obtener_metricas_dashboard(p_agencia_id uuid)
RETURNS TABLE (
    total_propiedades bigint,
    disponibles bigint,
    separadas bigint,
    vendidas bigint,
    total_clicks bigint,
    total_leads bigint,
    avance_porcentaje numeric,
    total_ventas_pen numeric,
    total_ventas_usd numeric
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT
        count(*)::bigint AS total_propiedades,
        count(*) FILTER (WHERE estado = 'disponible')::bigint AS disponibles,
        count(*) FILTER (WHERE estado = 'separado')::bigint AS separadas,
        count(*) FILTER (WHERE estado = 'vendido')::bigint AS vendidas,
        COALESCE((
            SELECT count(*) 
            FROM public.metricas_clicks mc 
            JOIN public.propiedades p ON mc.propiedad_id = p.id 
            WHERE p.agencia_id = p_agencia_id
        ), 0)::bigint AS total_clicks,
        COALESCE((
            SELECT count(*) 
            FROM public.leads l 
            JOIN public.propiedades p ON l.propiedad_id = p.id 
            WHERE p.agencia_id = p_agencia_id
        ), 0)::bigint AS total_leads,
        CASE
            WHEN count(*) > 0 THEN
                ROUND(
                    ((count(*) FILTER (WHERE estado IN ('separado', 'vendido')))::numeric / count(*)::numeric) * 100,
                    1
                )
            ELSE 0
        END AS avance_porcentaje,
        -- Total sales in PEN (separated + sold properties)
        COALESCE((
            SELECT SUM(p.precio) 
            FROM public.propiedades p 
            WHERE p.agencia_id = p_agencia_id 
            AND p.estado IN ('separado', 'vendido')
            AND p.moneda = 'PEN'
        ), 0) AS total_ventas_pen,
        -- Total sales in USD (separated + sold properties)
        COALESCE((
            SELECT SUM(p.precio) 
            FROM public.propiedades p 
            WHERE p.agencia_id = p_agencia_id 
            AND p.estado IN ('separado', 'vendido')
            AND p.moneda = 'USD'
        ), 0) AS total_ventas_usd
    FROM public.propiedades
    WHERE agencia_id = p_agencia_id;
$$;