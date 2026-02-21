-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "advanced_settings" JSONB;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "tools_extras" JSONB;
