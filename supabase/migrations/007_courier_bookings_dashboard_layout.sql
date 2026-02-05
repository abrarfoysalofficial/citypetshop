-- courier_bookings: per-order booking log (provider, consignment_id, tracking, label, request/response)
CREATE TABLE IF NOT EXISTS courier_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  consignment_id TEXT,
  tracking_code TEXT,
  label_url TEXT,
  waybill_url TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'failed', 'cancelled')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_courier_bookings_order ON courier_bookings(order_id);
CREATE INDEX IF NOT EXISTS idx_courier_bookings_provider ON courier_bookings(provider);
CREATE INDEX IF NOT EXISTS idx_courier_bookings_created ON courier_bookings(created_at DESC);

-- dashboard_layout: per admin user/role widget order and visibility
CREATE TABLE IF NOT EXISTS dashboard_layout (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID,
  role TEXT,
  layout_json JSONB NOT NULL DEFAULT '[]',
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layout_user ON dashboard_layout(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layout_role ON dashboard_layout(role);

-- site_settings: courier default provider, sandbox toggle (use existing or add)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS courier_default_provider TEXT DEFAULT 'pathao';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS courier_sandbox BOOLEAN DEFAULT TRUE;

-- RLS
ALTER TABLE courier_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full courier_bookings" ON courier_bookings FOR ALL USING (true);

ALTER TABLE dashboard_layout ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full dashboard_layout" ON dashboard_layout FOR ALL USING (true);
