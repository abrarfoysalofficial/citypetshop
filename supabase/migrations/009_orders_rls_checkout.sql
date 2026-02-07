-- Orders RLS: secure policies for checkout and listing.
-- - Anyone can INSERT orders/order_items (checkout: guest or auth).
-- - Users see only their own orders (user_id = auth.uid()); admins see all (team_members.role = 'admin').

-- Helper: true if current user is in team_members with role admin
CREATE OR REPLACE FUNCTION is_team_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- Orders: drop permissive policy and add explicit ones
DROP POLICY IF EXISTS "Allow all for now" ON orders;

CREATE POLICY "orders_insert_checkout"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_select_own_or_admin"
  ON orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_team_admin()
  );

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (is_team_admin())
  WITH CHECK (is_team_admin());

-- Order items: drop permissive policy and add explicit ones
DROP POLICY IF EXISTS "Allow all order_items" ON order_items;

CREATE POLICY "order_items_insert_checkout"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (o.user_id IS NOT DISTINCT FROM auth.uid())
    )
  );

CREATE POLICY "order_items_select_own_or_admin"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR is_team_admin())
    )
  );

-- Admin can read vouchers and activity_log (for admin dashboard)
DROP POLICY IF EXISTS "No public vouchers read" ON vouchers;
CREATE POLICY "vouchers_select_admin" ON vouchers FOR SELECT USING (is_team_admin());

DROP POLICY IF EXISTS "No public activity_log" ON activity_log;
CREATE POLICY "activity_log_select_admin" ON activity_log FOR SELECT USING (is_team_admin());
