-- Fix: explicit search_path on functions (Supabase lint: function_search_path_mutable)
-- Use ALTER FUNCTION to set search_path without dropping (preserves dependent triggers)

ALTER FUNCTION public.handle_updated_at() SET search_path = '';

ALTER FUNCTION public.obtener_top_clicks(uuid, int) SET search_path = '';

ALTER FUNCTION public.obtener_metricas_dashboard(uuid) SET search_path = '';