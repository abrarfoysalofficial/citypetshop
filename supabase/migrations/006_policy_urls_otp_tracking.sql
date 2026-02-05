-- Policy URLs (Terms, Privacy) and OTP-for-phone-tracking toggle
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS terms_url TEXT DEFAULT '/terms';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS privacy_url TEXT DEFAULT '/privacy';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS require_otp_phone_tracking BOOLEAN DEFAULT FALSE;
