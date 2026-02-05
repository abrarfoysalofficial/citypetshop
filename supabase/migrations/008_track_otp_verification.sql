-- OTP verification for phone-based order tracking (when require_otp_phone_tracking is ON)
CREATE TABLE IF NOT EXISTS track_otp_verification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  phone_normalized TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_track_otp_phone ON track_otp_verification(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_track_otp_expires ON track_otp_verification(expires_at);

-- Verified tokens: after OTP success, client sends this token with GET track-order to get full details
CREATE TABLE IF NOT EXISTS track_verified_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token UUID NOT NULL UNIQUE,
  phone_normalized TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_track_verified_tokens_token ON track_verified_tokens(token);
CREATE INDEX IF NOT EXISTS idx_track_verified_tokens_expires ON track_verified_tokens(expires_at);

-- RLS
ALTER TABLE track_otp_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full track_otp" ON track_otp_verification FOR ALL USING (true);

ALTER TABLE track_verified_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full track_verified_tokens" ON track_verified_tokens FOR ALL USING (true);
