-- =============================================================================
-- ADMIN LIVE SCHEMA: New tables + RLS for fully Supabase admin panel
-- =============================================================================
-- Tables: categories, product_rams, product_weights, product_sizes,
--         home_banner_slides, home_banners, home_side_banners, home_bottom_banners
-- Storage: product-images, banner-images (run separately in Dashboard)
-- =============================================================================

-- Add is_admin to team_members for flexible admin check
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update is_team_admin to support email match + role/admin
CREATE OR REPLACE FUNCTION is_team_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE (user_id = auth.uid() OR lower(email) = lower(coalesce(auth.email(), '')))
    AND is_active = true
    AND (role = 'admin' OR is_admin = true)
  );
$$;

-- =============================================================================
-- CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_bn TEXT,
  description_en TEXT,
  description_bn TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- =============================================================================
-- PRODUCT RAMS / WEIGHTS / SIZES (variant attributes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_rams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS product_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- HOME BANNER SLIDES (hero slider)
-- =============================================================================
CREATE TABLE IF NOT EXISTS home_banner_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT NOT NULL,
  title_en TEXT,
  title_bn TEXT,
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- HOME BANNERS (main banners)
-- =============================================================================
CREATE TABLE IF NOT EXISTS home_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT NOT NULL,
  title_en TEXT,
  title_bn TEXT,
  link TEXT,
  cta_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- HOME SIDE BANNERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS home_side_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT NOT NULL,
  title_en TEXT,
  title_bn TEXT,
  link TEXT,
  cta_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- HOME BOTTOM BANNERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS home_bottom_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url TEXT NOT NULL,
  title_en TEXT,
  title_bn TEXT,
  link TEXT,
  cta_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- UPDATED_AT triggers
-- =============================================================================
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER product_rams_updated_at BEFORE UPDATE ON product_rams
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER product_weights_updated_at BEFORE UPDATE ON product_weights
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER product_sizes_updated_at BEFORE UPDATE ON product_sizes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER home_banner_slides_updated_at BEFORE UPDATE ON home_banner_slides
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER home_banners_updated_at BEFORE UPDATE ON home_banners
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER home_side_banners_updated_at BEFORE UPDATE ON home_side_banners
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER home_bottom_banners_updated_at BEFORE UPDATE ON home_bottom_banners
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- =============================================================================
-- RLS: team_members - user reads own row by email
-- =============================================================================
DROP POLICY IF EXISTS "Users read own team_members" ON team_members;
CREATE POLICY "Users read own team_members"
  ON team_members FOR SELECT
  USING (lower(email) = lower(coalesce(auth.email(), '')));

-- =============================================================================
-- RLS: Admin-only tables (categories, product_rams, product_weights, product_sizes, banners)
-- =============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin categories all" ON categories;
CREATE POLICY "Admin categories all" ON categories FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE product_rams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin product_rams all" ON product_rams FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE product_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin product_weights all" ON product_weights FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin product_sizes all" ON product_sizes FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE home_banner_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin home_banner_slides all" ON home_banner_slides FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE home_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin home_banners all" ON home_banners FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE home_side_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin home_side_banners all" ON home_side_banners FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

ALTER TABLE home_bottom_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin home_bottom_banners all" ON home_bottom_banners FOR ALL
  USING (is_team_admin()) WITH CHECK (is_team_admin());

-- Public read for categories (storefront)
CREATE POLICY "Public read active categories" ON categories FOR SELECT
  USING (is_active = true);

-- Add product columns: brand, rating, discount (if not exist)
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
