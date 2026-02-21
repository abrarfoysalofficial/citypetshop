-- Add unique constraint on draft_orders.session_id for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS "draft_orders_session_id_key" ON "draft_orders"("session_id");
