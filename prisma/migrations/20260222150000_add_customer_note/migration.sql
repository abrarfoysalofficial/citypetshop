-- CreateTable
CREATE TABLE IF NOT EXISTS "customer_notes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "customer_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_notes_customer_id_idx" ON "customer_notes"("customer_id");

-- AddForeignKey
ALTER TABLE "customer_notes" DROP CONSTRAINT IF EXISTS "customer_notes_customer_id_fkey";
ALTER TABLE "customer_notes" ADD CONSTRAINT "customer_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
