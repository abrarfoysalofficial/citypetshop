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
