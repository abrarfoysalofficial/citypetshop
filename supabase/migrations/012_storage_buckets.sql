-- =============================================================================
-- STORAGE POLICIES for admin uploads
-- =============================================================================
-- Create buckets manually in Supabase Dashboard: Storage -> New bucket
-- - product-images (public, 5MB, image/*)
-- - banner-images (public, 5MB, image/*)
--
-- These policies assume buckets exist. Run after creating buckets.
-- =============================================================================

-- product-images: admins can upload
DROP POLICY IF EXISTS "Admin upload product-images" ON storage.objects;
CREATE POLICY "Admin upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND (SELECT is_team_admin())
  );

-- product-images: public read
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- banner-images: admins can upload
DROP POLICY IF EXISTS "Admin upload banner-images" ON storage.objects;
CREATE POLICY "Admin upload banner-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banner-images' AND (SELECT is_team_admin())
  );

-- banner-images: public read
DROP POLICY IF EXISTS "Public read banner-images" ON storage.objects;
CREATE POLICY "Public read banner-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-images');
