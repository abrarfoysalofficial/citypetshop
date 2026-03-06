-- AlterTable
ALTER TABLE "courier_booking_logs" ADD COLUMN     "sandbox" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "courier_booking_logs_created_at_idx" ON "courier_booking_logs"("created_at");
