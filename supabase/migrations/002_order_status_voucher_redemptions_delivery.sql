-- Extended order statuses, voucher_redemptions, delivery rules in site_settings

-- Extend order_status enum (add new values; run once)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'shipped' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
    ALTER TYPE order_status ADD VALUE 'shipped';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refund_requested' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
    ALTER TYPE order_status ADD VALUE 'refund_requested';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refunded' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
    ALTER TYPE order_status ADD VALUE 'refunded';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'failed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
    ALTER TYPE order_status ADD VALUE 'failed';
  END IF;
END $$;

-- Voucher redemptions (who used which voucher on which order)
CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID,
  discount_applied NUMERIC(12,2) NOT NULL,

  UNIQUE(order_id)
);

CREATE INDEX idx_voucher_redemptions_voucher ON voucher_redemptions(voucher_id);
CREATE INDEX idx_voucher_redemptions_order ON voucher_redemptions(order_id);

-- Delivery rules in site_settings (add columns)
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS delivery_inside_dhaka NUMERIC(10,2) DEFAULT 70,
  ADD COLUMN IF NOT EXISTS delivery_outside_dhaka NUMERIC(10,2) DEFAULT 130,
  ADD COLUMN IF NOT EXISTS delivery_weight_kg_increment NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_shipping_rules JSONB DEFAULT '[]';

-- Vouchers: per_user_limit, valid_from, applicable categories/products, free_shipping
ALTER TABLE vouchers
  ADD COLUMN IF NOT EXISTS per_user_limit INTEGER,
  ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS applicable_categories TEXT[],
  ADD COLUMN IF NOT EXISTS applicable_product_ids UUID[],
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN NOT NULL DEFAULT FALSE;

-- Order notes (admin + courier rider note)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_rider_note TEXT;

-- RLS voucher_redemptions
ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public voucher_redemptions" ON voucher_redemptions FOR SELECT USING (false);
