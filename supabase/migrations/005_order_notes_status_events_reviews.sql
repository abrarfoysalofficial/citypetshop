-- order_notes: admin/courier/system notes with visibility
CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('admin', 'courier', 'system')),
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('public', 'internal')),
  message TEXT NOT NULL,
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_notes_order ON order_notes(order_id);

-- order_status_events: courier + internal status updates
CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT,
  status TEXT NOT NULL,
  payload_summary JSONB
);

CREATE INDEX IF NOT EXISTS idx_order_status_events_order ON order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_phone ON orders(guest_phone);

-- product_reviews: Supabase-backed reviews with moderation
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  UNIQUE(order_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_order ON product_reviews(order_id);

-- analytics_events: event_id dedup, match quality proxies
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  event_id TEXT UNIQUE,
  source TEXT NOT NULL DEFAULT 'browser',
  page_url TEXT,
  referrer TEXT,
  user_id UUID,
  session_id TEXT,
  payload_summary JSONB,
  has_email_hash BOOLEAN DEFAULT FALSE,
  has_phone_hash BOOLEAN DEFAULT FALSE,
  has_fbp BOOLEAN DEFAULT FALSE,
  has_fbc BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_id ON analytics_events(event_id);

-- site_settings: review_eligible_days
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS review_eligible_days INTEGER DEFAULT 90;

-- RLS for new tables (service_role bypasses RLS; anon uses these)
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read public order_notes" ON order_notes FOR SELECT USING (visibility = 'public');

ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read order_status_events" ON order_status_events FOR SELECT USING (true);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read approved product_reviews" ON product_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Insert product_reviews" ON product_reviews FOR INSERT WITH CHECK (true);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert analytics_events" ON analytics_events FOR INSERT WITH CHECK (true);
