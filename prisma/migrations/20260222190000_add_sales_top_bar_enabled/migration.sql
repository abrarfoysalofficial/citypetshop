-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sales_top_bar_enabled" BOOLEAN NOT NULL DEFAULT true;
