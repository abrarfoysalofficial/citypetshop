-- Payment webhook log for idempotency and audit
CREATE TABLE IF NOT EXISTS "payment_webhook_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "val_id" TEXT,
    "gateway" TEXT NOT NULL DEFAULT 'sslcommerz',
    "status" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "raw_payload" JSONB,

    CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_webhook_logs_val_id_key" ON "payment_webhook_logs"("val_id");
CREATE INDEX IF NOT EXISTS "payment_webhook_logs_order_id_idx" ON "payment_webhook_logs"("order_id");
