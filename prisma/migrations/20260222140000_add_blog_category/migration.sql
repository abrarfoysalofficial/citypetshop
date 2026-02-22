-- CreateTable
CREATE TABLE IF NOT EXISTS "blog_categories" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_key" ON "blog_categories"("slug");

-- AddColumn to cms_pages
ALTER TABLE "cms_pages" ADD COLUMN IF NOT EXISTS "blog_category_id" TEXT;

-- AddForeignKey
ALTER TABLE "cms_pages" DROP CONSTRAINT IF EXISTS "cms_pages_blog_category_id_fkey";
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_blog_category_id_fkey" FOREIGN KEY ("blog_category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
