-- CreateTable
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses"("category");
CREATE INDEX IF NOT EXISTS "expenses_date_idx" ON "expenses"("date");
