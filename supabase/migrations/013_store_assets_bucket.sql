-- =============================================================================
-- STORAGE: store-assets bucket policies (logos, store assets)
-- =============================================================================
-- Create bucket manually: Storage -> New bucket -> store-assets (public, 5MB, image/*)
-- =============================================================================

DROP POLICY IF EXISTS "Admin upload store-assets" ON storage.objects;
CREATE POLICY "Admin upload store-assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-assets' AND (SELECT is_team_admin())
  );

DROP POLICY IF EXISTS "Public read store-assets" ON storage.objects;
CREATE POLICY "Public read store-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');
