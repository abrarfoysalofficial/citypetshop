-- Phase 2: Order tags
CREATE TABLE IF NOT EXISTS "order_tags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "order_tags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "order_tags_order_id_idx" ON "order_tags"("order_id");
CREATE INDEX IF NOT EXISTS "order_tags_tag_idx" ON "order_tags"("tag");

ALTER TABLE "order_tags" ADD CONSTRAINT "order_tags_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 3: Inventory, collections, flash sale
CREATE TABLE IF NOT EXISTS "inventory_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "ref_id" TEXT,
    "note" TEXT,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inventory_logs_product_id_idx" ON "inventory_logs"("product_id");
CREATE INDEX IF NOT EXISTS "inventory_logs_created_at_idx" ON "inventory_logs"("created_at" DESC);

CREATE TABLE IF NOT EXISTS "collections" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_bn" TEXT,
    "product_ids" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "collections_slug_key" ON "collections"("slug");

CREATE TABLE IF NOT EXISTS "flash_sale_rules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "discount_pct" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "flash_sale_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "flash_sale_rules_product_id_idx" ON "flash_sale_rules"("product_id");
CREATE INDEX IF NOT EXISTS "flash_sale_rules_end_at_idx" ON "flash_sale_rules"("end_at");

-- Phase 4: Landing pages
CREATE TABLE IF NOT EXISTS "landing_pages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "layout_json" JSONB NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "seo_title" TEXT,
    "seo_desc" TEXT,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landing_pages_slug_key" ON "landing_pages"("slug");

CREATE TABLE IF NOT EXISTS "landing_blocks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "page_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config_json" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "landing_blocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "landing_blocks_page_id_idx" ON "landing_blocks"("page_id");

ALTER TABLE "landing_blocks" ADD CONSTRAINT "landing_blocks_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 5: CRM
CREATE TABLE IF NOT EXISTS "customers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "user_id" TEXT,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "last_order_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_key" ON "customers"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "customers_phone_key" ON "customers"("phone");

CREATE TABLE IF NOT EXISTS "reminders" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "template_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reminders_customer_id_idx" ON "reminders"("customer_id");
CREATE INDEX IF NOT EXISTS "reminders_scheduled_at_idx" ON "reminders"("scheduled_at");

ALTER TABLE "reminders" ADD CONSTRAINT "reminders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "reminder_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminder_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "error" TEXT,

    CONSTRAINT "reminder_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "conversion_tracking" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reminder_id" TEXT NOT NULL,
    "order_id" TEXT,
    "revenue" DECIMAL(12,2),
    "converted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "conversion_tracking_pkey" PRIMARY KEY ("id")
);

-- Phase 6: Campaign performance
CREATE TABLE IF NOT EXISTS "campaign_performance" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform" TEXT NOT NULL,
    "campaign_id" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,

    CONSTRAINT "campaign_performance_pkey" PRIMARY KEY ("id")
);

-- Phase 7: Conversations
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL,
    "customer_id" TEXT,
    "guest_phone" TEXT,
    "guest_email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolved_by" TEXT,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "conversation_messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 9: Draft orders
CREATE TABLE IF NOT EXISTS "draft_orders" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "session_id" TEXT NOT NULL,
    "guest_email" TEXT,
    "guest_phone" TEXT,
    "guest_name" TEXT,
    "cart_json" JSONB NOT NULL,
    "shipping_json" JSONB,
    "last_activity_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_orders_pkey" PRIMARY KEY ("id")
);

-- Phase 10: Fraud
CREATE TABLE IF NOT EXISTS "fraud_flags" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "flag_type" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "details_json" JSONB,

    CONSTRAINT "fraud_flags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "blocked_ips" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "reason" TEXT,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "blocked_ips_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blocked_ips_ip_key" ON "blocked_ips"("ip");

CREATE TABLE IF NOT EXISTS "risk_scores" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "factors_json" JSONB,

    CONSTRAINT "risk_scores_pkey" PRIMARY KEY ("id")
);

-- Phase 11: Live visitors
CREATE TABLE IF NOT EXISTS "live_visitors" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "page_url" TEXT,
    "referrer" TEXT,
    "first_seen" TIMESTAMP(3) NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_visitors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "live_visitors_session_id_key" ON "live_visitors"("session_id");

-- Add draft to order_status enum (PostgreSQL)
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'draft';
