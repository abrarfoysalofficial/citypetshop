-- =============================================================================
-- RLS POLICIES FOR ADMIN AUTHORIZATION
-- =============================================================================
-- Run in Supabase SQL Editor. Fixes team_members read and adds admin policies.
--
-- 1. team_members: Must allow users to read their own row (for auth check).
--    The initial schema has "No public team_members" with USING (false) which
--    blocks ALL reads. Replace with policy allowing own-row read.
-- =============================================================================

-- Drop the blocking policy and add permissive one for own-row read
DROP POLICY IF EXISTS "No public team_members" ON team_members;

CREATE POLICY "Users read own team_members"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR lower(email) = lower(auth.email())
  );

-- =============================================================================
-- Optional: Add admin policies for products, site_settings, payment_gateways
-- if your schema uses restrictive RLS. The is_team_admin() function from
-- migration 009 already exists and checks team_members by user_id.
--
-- Products: Add admin UPDATE/DELETE if needed (public can already SELECT active)
-- Site_settings: Add admin UPDATE (public can SELECT)
-- Payment_gateways: Add admin SELECT all + UPDATE (public can SELECT active only)
-- =============================================================================

-- Products: Admin can INSERT, UPDATE, DELETE (in addition to public SELECT active)
DROP POLICY IF EXISTS "Admin products write" ON products;
CREATE POLICY "Admin products write"
  ON products FOR ALL
  USING (is_team_admin())
  WITH CHECK (is_team_admin());

-- Note: If "Public read products" exists, it may conflict. You may need:
-- DROP POLICY IF EXISTS "Public read products" ON products;
-- Then add separate SELECT for public (is_active) and admin (all).

-- site_settings: Admin can UPDATE
DROP POLICY IF EXISTS "Admin site_settings update" ON site_settings;
CREATE POLICY "Admin site_settings update"
  ON site_settings FOR UPDATE
  USING (is_team_admin())
  WITH CHECK (is_team_admin());

-- payment_gateways: Admin can SELECT all and UPDATE
DROP POLICY IF EXISTS "Admin payment_gateways full" ON payment_gateways;
CREATE POLICY "Admin payment_gateways full"
  ON payment_gateways FOR ALL
  USING (is_team_admin())
  WITH CHECK (is_team_admin());
