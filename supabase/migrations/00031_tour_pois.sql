-- Migration 00031: Tour POIs (Points of Interest)
-- Creates: tour_pois table with RLS and indexes

-- 1. TOUR_POIS TABLE
CREATE TABLE public.tour_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES public.tours_360(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  poi_type TEXT NOT NULL CHECK (poi_type IN (
    'amenity', 'road', 'attraction', 'landmark', 'other'
  )),
  icon TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES for performance
CREATE INDEX idx_tour_pois_tour ON public.tour_pois(tour_id);
CREATE INDEX idx_tour_pois_type ON public.tour_pois(poi_type);

-- 3. RLS (Row Level Security)
ALTER TABLE public.tour_pois ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can see POIs on published tours)
CREATE POLICY "poi_read_all" ON public.tour_pois
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "poi_write_admin" ON public.tour_pois
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios_rol WHERE auth_user_id = auth.uid() AND rol = 'admin')
  );

-- 4. TRIGGER: updated_at auto-update
CREATE TRIGGER set_updated_at_tour_pois BEFORE UPDATE ON public.tour_pois
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. COMMENTS for documentation
COMMENT ON TABLE public.tour_pois IS 'Points of Interest for virtual 360° tours (amenities, landmarks, etc.)';
COMMENT ON COLUMN public.tour_pois.poi_type IS 'POI category: amenity, road, attraction, landmark, other';
COMMENT ON COLUMN public.tour_pois.lat IS 'Latitude coordinate for POI placement';
COMMENT ON COLUMN public.tour_pois.lng IS 'Longitude coordinate for POI placement';
