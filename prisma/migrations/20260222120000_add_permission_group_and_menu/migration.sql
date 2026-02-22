-- CreateTable
CREATE TABLE IF NOT EXISTS "permission_groups" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "permission_groups_slug_key" ON "permission_groups"("slug");

-- AddColumn to permissions
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "group_id" TEXT;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "menu_label" TEXT;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "menu_href" TEXT;
ALTER TABLE "permissions" ADD COLUMN IF NOT EXISTS "menu_sort_order" INTEGER DEFAULT 0;

-- AddForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT IF EXISTS "permissions_group_id_fkey";
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "permission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
