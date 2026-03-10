-- Ensure tenants table exists (handles legacy DBs or migration order issues)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') THEN
    CREATE TABLE "tenants" (
      "id" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
    CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");
    CREATE INDEX "tenants_is_active_idx" ON "tenants"("is_active");
    INSERT INTO "tenants" ("id", "created_at", "updated_at", "slug", "name", "is_active")
    VALUES ('00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'default', 'Default', true);
  END IF;
END $$;

-- CreateTable
CREATE TABLE "secure_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value_enc" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secure_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secure_config_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secure_config_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "secure_configs_tenant_id_idx" ON "secure_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "secure_configs_tenant_id_key_key" ON "secure_configs"("tenant_id", "key");

-- CreateIndex
CREATE INDEX "secure_config_audit_logs_tenant_id_idx" ON "secure_config_audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "secure_config_audit_logs_key_idx" ON "secure_config_audit_logs"("key");

-- CreateIndex
CREATE INDEX "secure_config_audit_logs_created_at_idx" ON "secure_config_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "secure_configs" ADD CONSTRAINT "secure_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_config_audit_logs" ADD CONSTRAINT "secure_config_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secure_config_audit_logs" ADD CONSTRAINT "secure_config_audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
