-- Premium Digital Pet Shop - Initial Schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- SITE SETTINGS (single row - global config)
-- =============================================================================
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  logo_url TEXT,
  logo_dark_url TEXT,
  site_name_en TEXT NOT NULL DEFAULT 'City Plus Pet Shop',
  site_name_bn TEXT,
  tagline_en TEXT,
  tagline_bn TEXT,

  primary_color TEXT NOT NULL DEFAULT '#0f172a',
  secondary_color TEXT NOT NULL DEFAULT '#06b6d4',
  accent_color TEXT NOT NULL DEFAULT '#f97316',
  font_family TEXT,
  button_style TEXT,

  navbar_links JSONB NOT NULL DEFAULT '[]',
  footer_text_en TEXT,
  footer_text_bn TEXT,
  footer_links JSONB NOT NULL DEFAULT '[]',
  copyright_text TEXT,

  social_links JSONB NOT NULL DEFAULT '[]',
  address_en TEXT,
  address_bn TEXT,
  phone TEXT,
  email TEXT,
  whatsapp_number TEXT,

  hero_slider JSONB NOT NULL DEFAULT '[]',
  side_banners JSONB NOT NULL DEFAULT '[]',
  cta_buttons JSONB NOT NULL DEFAULT '[]',
  popup_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  popup_content_en TEXT,
  popup_content_bn TEXT,
  popup_image_url TEXT,

  facebook_pixel_id TEXT,
  facebook_capi_token TEXT,
  google_analytics_id TEXT,
  google_tag_manager_id TEXT,

  default_meta_title TEXT,
  default_meta_description TEXT,
  default_og_image_url TEXT
);

INSERT INTO site_settings (id) VALUES ('default');

-- =============================================================================
-- PRODUCTS
-- =============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name_en TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_bn TEXT,

  buying_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  weight_kg NUMERIC(8,3),
  sku TEXT,

  category_slug TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  seo_title TEXT,
  seo_description TEXT,
  seo_tags TEXT[],
  meta_og_image TEXT
);

CREATE INDEX idx_products_category ON products(category_slug);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;

-- =============================================================================
-- ORDERS
-- =============================================================================
CREATE TYPE order_status AS ENUM (
  'pending', 'processing', 'handed_to_courier', 'delivered', 'cancelled', 'returned'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID,
  guest_email TEXT,
  guest_phone TEXT,
  guest_name TEXT,

  status order_status NOT NULL DEFAULT 'pending',
  subtotal NUMERIC(12,2) NOT NULL,
  delivery_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,

  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_meta JSONB,

  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_area TEXT,
  shipping_notes TEXT,

  courier_provider TEXT,
  courier_booking_id TEXT,
  tracking_code TEXT,
  delivery_method TEXT,
  rider_note TEXT,

  voucher_code TEXT
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  image_url TEXT
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =============================================================================
-- COURIER CONFIGS
-- =============================================================================
CREATE TABLE courier_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  provider TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  api_key TEXT,
  api_secret TEXT,
  api_url TEXT,
  config_json JSONB
);

INSERT INTO courier_configs (provider) VALUES ('steadfast'), ('pathao'), ('redx');

-- =============================================================================
-- PAYMENT GATEWAYS
-- =============================================================================
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  gateway TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  display_name_en TEXT NOT NULL,
  display_name_bn TEXT,
  credentials_json JSONB
);

INSERT INTO payment_gateways (gateway, display_name_en) VALUES
  ('cod', 'Cash on Delivery'),
  ('bkash', 'bKash'),
  ('nagad', 'Nagad'),
  ('sslcommerz', 'Card / Bank');

-- =============================================================================
-- VOUCHERS
-- =============================================================================
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value NUMERIC(12,2) NOT NULL,
  min_order_amount NUMERIC(12,2),
  expiry_at TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- TEAM MEMBERS (Admin roles)
-- =============================================================================
CREATE TYPE team_role AS ENUM ('admin', 'editor', 'support');

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'support',
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- ANALYTICS (event logs)
-- =============================================================================
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  event_type TEXT NOT NULL,
  session_id TEXT,
  user_id UUID,
  payload JSONB,

  page_url TEXT,
  referrer TEXT,
  device_type TEXT
);

CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_created ON analytics(created_at DESC);

-- =============================================================================
-- ACTIVITY LOG (Audit)
-- =============================================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  actor_type TEXT NOT NULL,
  actor_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- =============================================================================
-- CMS PAGES (Blog, About, Legal)
-- =============================================================================
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_bn TEXT,
  content_en TEXT,
  content_bn TEXT,
  excerpt_en TEXT,
  excerpt_bn TEXT,

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  template TEXT,

  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT
);

-- =============================================================================
-- RLS (Row Level Security) - Basic policies
-- =============================================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- Admin/authenticated can manage; users see own orders (handled in app with service role if needed)
CREATE POLICY "Allow all for now" ON orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE courier_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public courier_configs" ON courier_configs FOR SELECT USING (false);

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active payment_gateways" ON payment_gateways FOR SELECT USING (is_active = true);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public vouchers read" ON vouchers FOR SELECT USING (false);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public team_members" ON team_members FOR SELECT USING (false);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert analytics" ON analytics FOR INSERT WITH CHECK (true);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public activity_log" ON activity_log FOR SELECT USING (false);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published cms_pages" ON cms_pages FOR SELECT USING (is_published = true);

-- =============================================================================
-- UPDATED_AT trigger helper
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER courier_configs_updated_at BEFORE UPDATE ON courier_configs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER payment_gateways_updated_at BEFORE UPDATE ON payment_gateways
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER vouchers_updated_at BEFORE UPDATE ON vouchers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER cms_pages_updated_at BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
