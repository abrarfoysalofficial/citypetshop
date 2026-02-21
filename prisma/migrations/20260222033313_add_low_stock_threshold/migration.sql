-- AddColumn: low_stock_threshold on products (nullable integer)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "low_stock_threshold" INTEGER;
