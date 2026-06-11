-- Migration 00029: Backfill panorama centers for existing tours
-- Updates center_lat_lng for each scene based on project location
-- Run AFTER migration 00028

-- 1. First, let's see what tours exist and their current escenas
-- SELECT id, proyecto_id, nombre, jsonb_array_length(escenas) as scene_count FROM tours_360;

-- 2. Backfill with project-specific coordinates
-- Update each tour's scenes with the correct panorama center based on project location

-- Ayacucho projects (default: -13.163, -74.224)
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
  AND escenas IS NOT NULL
  AND NOT (escenas @> '[{"center_lat_lng": {}}]'::jsonb);

-- 3. Verify backfill
-- SELECT 
--   id, 
--   nombre,
--   jsonb_array_length(escenas) as scene_count,
--   escenas->0->'center_lat_lng' as first_scene_center
-- FROM tours_360 
-- WHERE escenas != '[]'::jsonb;

-- 4. Comment for documentation
COMMENT ON COLUMN public.tours_360.escenas IS 'Array of scenes: [{id, textureUrl, thumbnailUrl, yaw, pitch, fov, hotspots, center_lat_lng}]';
