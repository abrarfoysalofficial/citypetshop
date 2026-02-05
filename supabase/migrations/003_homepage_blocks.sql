-- Homepage dynamic blocks (order + enable/disable) – enterprise upgrade
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS homepage_blocks JSONB DEFAULT NULL;

COMMENT ON COLUMN site_settings.homepage_blocks IS 'Array of { id, type, enabled, order, titleEn?, titleBn?, subtitle? } for Featured, Flash Sale, Clearance, Combo Offers.';
