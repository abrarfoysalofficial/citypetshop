-- Auth provider toggles for Admin-configurable login methods
-- Google, Facebook, Phone OTP (Bangladesh)
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS auth_providers JSONB DEFAULT '{"google": false, "facebook": false, "phone": false}'::jsonb;
