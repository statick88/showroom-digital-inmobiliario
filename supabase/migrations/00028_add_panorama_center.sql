-- Migration 00028: Add panorama center coordinates to tour scenes
-- Adds center_lat_lng JSONB to each escena element in tours_360.escenas
-- Backfills Ayacucho scenes with default coordinates

-- 1. Backfill existing scenes that have escenas but no center_lat_lng
UPDATE public.tours_360
SET escenas = (
  SELECT jsonb_agg(
    CASE
      WHEN elem ? 'center_lat_lng' THEN elem
      ELSE elem || '{"center_lat_lng": {"lat": -13.163, "lng": -74.224}}'::jsonb
    END
  )
  FROM jsonb_array_elements(escenas) AS elem
)
WHERE escenas != '[]'::jsonb
  AND escenas IS NOT NULL;

-- 2. Comment for documentation
COMMENT ON COLUMN public.tours_360.escenas IS 'Array of scenes: [{id, textureUrl, thumbnailUrl, yaw, pitch, fov, hotspots, center_lat_lng}]';
