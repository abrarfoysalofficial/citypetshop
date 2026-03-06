-- CreateTable
CREATE TABLE "courier_booking_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "consignment_id" TEXT NOT NULL,
    "tracking_code" TEXT,
    "request_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_booking_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_booking_logs_tenant_id_idx" ON "courier_booking_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "courier_booking_logs_order_id_idx" ON "courier_booking_logs"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "courier_booking_logs_tenant_id_order_id_provider_key" ON "courier_booking_logs"("tenant_id", "order_id", "provider");

-- AddForeignKey
ALTER TABLE "courier_booking_logs" ADD CONSTRAINT "courier_booking_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
