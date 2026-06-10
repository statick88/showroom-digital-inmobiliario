-- Migration 00030: Analytics Events for Tour Tracking
-- Creates: analytics_events table with RLS, indexes, and summary RPC

-- 1. ANALYTICS_EVENTS TABLE
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'parcel_click', 'tour_start', 'tour_end', 'whatsapp_click', 'share_click'
  )),
  tour_id UUID NOT NULL REFERENCES public.tours_360(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES for performance
CREATE INDEX idx_analytics_events_tour ON public.analytics_events(tour_id);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);

-- 3. RLS (Row Level Security)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Admin read access
CREATE POLICY "analytics_read_admin" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

-- Anonymous insert (visitors tracking events)
CREATE POLICY "analytics_insert_anon" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- 4. RPC: get_analytics_summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_tour_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
)
RETURNS TABLE(
  parcel_id UUID,
  parcel_code TEXT,
  total_clicks BIGINT,
  whatsapp_clicks BIGINT,
  share_clicks BIGINT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ae.parcel_id,
    COALESCE(l.codigo, 'Unknown') AS parcel_code,
    COUNT(*) FILTER (WHERE ae.event_type = 'parcel_click') AS total_clicks,
    COUNT(*) FILTER (WHERE ae.event_type = 'whatsapp_click') AS whatsapp_clicks,
    COUNT(*) FILTER (WHERE ae.event_type = 'share_click') AS share_clicks
  FROM public.analytics_events ae
  LEFT JOIN public.lotes l ON l.id = ae.parcel_id
  WHERE ae.tour_id = p_tour_id
    AND ae.created_at BETWEEN p_start AND p_end
  GROUP BY ae.parcel_id, l.codigo
  ORDER BY total_clicks DESC;
$$;

-- 5. COMMENTS for documentation
COMMENT ON TABLE public.analytics_events IS 'Tracks visitor interactions during virtual 360° tours';
COMMENT ON COLUMN public.analytics_events.event_type IS 'Type of analytics event: parcel_click, tour_start, tour_end, whatsapp_click, share_click';
COMMENT ON COLUMN public.analytics_events.visitor_id IS 'Anonymous visitor identifier for grouping events';
COMMENT ON COLUMN public.analytics_events.metadata IS 'Extensible event metadata (screen size, device type, etc.)';
COMMENT ON FUNCTION public.get_analytics_summary IS 'Returns aggregated analytics for a tour within a date range';
