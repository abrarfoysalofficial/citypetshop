-- Optional flexible columns for orders/order_items (idempotent).
-- Main schema remains 001; these allow extra payload without breaking existing code.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant JSONB DEFAULT '{}';

COMMENT ON COLUMN orders.metadata IS 'Optional app-specific payload (e.g. source, campaign).';
COMMENT ON COLUMN order_items.variant IS 'Optional variant info (e.g. size, color).';
