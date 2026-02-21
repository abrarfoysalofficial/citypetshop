-- Fraud policy (thresholds in DB)
CREATE TABLE IF NOT EXISTS "fraud_policy" (
    "id" TEXT NOT NULL,
    "block_threshold" INTEGER NOT NULL DEFAULT 60,
    "otp_threshold" INTEGER NOT NULL DEFAULT 40,
    "manual_review_threshold" INTEGER NOT NULL DEFAULT 30,
    "phone_velocity_limit" INTEGER NOT NULL DEFAULT 3,
    "phone_velocity_hours" INTEGER NOT NULL DEFAULT 24,
    "ip_risk_score_threshold" INTEGER NOT NULL DEFAULT 70,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_policy_pkey" PRIMARY KEY ("id")
);

INSERT INTO "fraud_policy" ("id", "block_threshold", "otp_threshold", "manual_review_threshold", "phone_velocity_limit", "phone_velocity_hours", "ip_risk_score_threshold", "updated_at")
VALUES ('default', 60, 40, 30, 3, 24, 70, NOW())
ON CONFLICT ("id") DO NOTHING;

-- Add review columns to fraud_flags (run manually if columns exist: ignore errors)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fraud_flags' AND column_name='review_status') THEN
    ALTER TABLE "fraud_flags" ADD COLUMN "review_status" TEXT NOT NULL DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fraud_flags' AND column_name='reviewed_by') THEN
    ALTER TABLE "fraud_flags" ADD COLUMN "reviewed_by" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fraud_flags' AND column_name='reviewed_at') THEN
    ALTER TABLE "fraud_flags" ADD COLUMN "reviewed_at" TIMESTAMP(3);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "fraud_flags_review_status_idx" ON "fraud_flags"("review_status");
