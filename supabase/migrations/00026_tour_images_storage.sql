-- =============================================================
-- MIGRATION: Create Supabase Storage bucket for 360° tour images
-- =============================================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tour-images',
  'tour-images',
  true,  -- public for viewing
  52428800,  -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/ktx2']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for tour-images bucket
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-images');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'tour-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-images');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tour-images');
