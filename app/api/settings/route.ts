import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { CTA_COLOR } from "@lib/theme-constants";
import type { SiteSettingsRow } from "@lib/schema";

export const dynamic = "force-dynamic";

const DEFAULTS: SiteSettingsRow = {
  id: "default",
  updated_at: new Date().toISOString(),
  logo_url: null,
  logo_dark_url: null,
  site_name_en: "City Plus Pet Shop",
  site_name_bn: null,
  tagline_en: "Your pet, our passion.",
  tagline_bn: null,
  primary_color: "#5cd4ff",
  secondary_color: "#06b6d4",
  accent_color: CTA_COLOR,
  font_family: null,
  button_style: null,
  navbar_links: [],
  footer_text_en: null,
  footer_text_bn: null,
  footer_links: [],
  copyright_text: null,
  social_links: [],
  address_en: null,
  address_bn: null,
  phone: null,
  email: null,
  whatsapp_number: null,
  hero_slider: [],
  side_banners: [],
  cta_buttons: [],
  popup_enabled: false,
  popup_content_en: null,
  popup_content_bn: null,
  popup_image_url: null,
  facebook_pixel_id: null,
  facebook_capi_token: null,
  google_analytics_id: null,
  google_tag_manager_id: null,
  tiktok_pixel_id: null,
  default_meta_title: null,
  default_meta_description: null,
  default_og_image_url: null,
  homepage_blocks: null,
  auth_providers: null,
};

/** GET /api/settings – public site settings (no secrets, no tokens) */
export async function GET() {
  try {
    const tenantId = getDefaultTenantId();
    const s = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!s) {
      return NextResponse.json(DEFAULTS, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }

    const data: SiteSettingsRow = {
      id: s.tenantId,
      updated_at: s.updatedAt.toISOString(),
      logo_url: s.logoUrl,
      logo_dark_url: s.logoDarkUrl,
      site_name_en: s.siteNameEn,
      site_name_bn: s.siteNameBn,
      tagline_en: s.taglineEn,
      tagline_bn: s.taglineBn,
      primary_color: s.primaryColor,
      secondary_color: s.secondaryColor,
      accent_color: s.accentColor,
      font_family: s.fontFamily,
      button_style: s.buttonStyle,
      navbar_links: Array.isArray(s.navbarLinks) ? (s.navbarLinks as unknown as SiteSettingsRow["navbar_links"]) : [],
      footer_text_en: s.footerTextEn,
      footer_text_bn: s.footerTextBn,
      footer_links: Array.isArray(s.footerLinks) ? (s.footerLinks as unknown as SiteSettingsRow["footer_links"]) : [],
      copyright_text: s.copyrightText,
      social_links: Array.isArray(s.socialLinks) ? (s.socialLinks as unknown as SiteSettingsRow["social_links"]) : [],
      address_en: s.addressEn,
      address_bn: s.addressBn,
      phone: s.phone,
      email: s.email,
      whatsapp_number: s.whatsappNumber,
      hero_slider: Array.isArray(s.heroSlider) ? (s.heroSlider as unknown as SiteSettingsRow["hero_slider"]) : [],
      side_banners: Array.isArray(s.sideBanners) ? (s.sideBanners as unknown as SiteSettingsRow["side_banners"]) : [],
      cta_buttons: Array.isArray(s.ctaButtons) ? (s.ctaButtons as unknown as SiteSettingsRow["cta_buttons"]) : [],
      popup_enabled: s.popupEnabled,
      popup_content_en: s.popupContentEn,
      popup_content_bn: s.popupContentBn,
      popup_image_url: s.popupImageUrl,
      // Do NOT expose facebook_capi_token or other secrets
      facebook_pixel_id: s.facebookPixelId,
      facebook_capi_token: null,
      google_analytics_id: s.googleAnalyticsId,
      google_tag_manager_id: s.googleTagManagerId,
      tiktok_pixel_id: s.tiktokPixelId,
      default_meta_title: s.defaultMetaTitle,
      default_meta_description: s.defaultMetaDescription,
      default_og_image_url: s.defaultOgImageUrl,
      homepage_blocks: s.homepageBlocks as SiteSettingsRow["homepage_blocks"],
      auth_providers: null,
      delivery_inside_dhaka: s.deliveryInsideDhaka ? Number(s.deliveryInsideDhaka) : undefined,
      delivery_outside_dhaka: s.deliveryOutsideDhaka ? Number(s.deliveryOutsideDhaka) : undefined,
      free_delivery_threshold: s.freeDeliveryThreshold ? Number(s.freeDeliveryThreshold) : undefined,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}
