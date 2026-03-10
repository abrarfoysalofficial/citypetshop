import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import { requireAdminAuth } from "@lib/admin-auth";
import { createAuditLog } from "@lib/audit";
import { isPrismaConfigured } from "@/src/config/env";
import { z } from "zod";

/** Minimal defaults when no tenant settings exist yet. */
const EMPTY_SETTINGS: Record<string, unknown> = {
  site_name_en: "City Pet Shop BD",
  primary_color: "#5cd4ff",
  accent_color: "#f39221",
  delivery_inside_dhaka: 70,
  delivery_outside_dhaka: 130,
  free_delivery_threshold: 2000,
  terms_url: "/terms",
  privacy_url: "/privacy",
};

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Admin: Prisma TenantSettings (tenant-scoped).
 */
export async function GET() {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  if (isPrismaConfigured()) {
    try {
      const tenantId = getDefaultTenantId();
      const s = await prisma.tenantSettings.findUnique({
        where: { tenantId },
      });
      if (!s) return NextResponse.json(EMPTY_SETTINGS);
      const data: Record<string, unknown> = {
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
        navbar_links: s.navbarLinks,
        footer_text_en: s.footerTextEn,
        footer_text_bn: s.footerTextBn,
        footer_links: s.footerLinks,
        copyright_text: s.copyrightText,
        social_links: s.socialLinks,
        address_en: s.addressEn,
        address_bn: s.addressBn,
        phone: s.phone,
        email: s.email,
        whatsapp_number: s.whatsappNumber,
        sales_top_bar_text: s.salesTopBarText,
        sales_top_bar_enabled: s.salesTopBarEnabled,
        cta_buttons: s.ctaButtons,
        popup_enabled: s.popupEnabled,
        popup_content_en: s.popupContentEn,
        popup_content_bn: s.popupContentBn,
        popup_image_url: s.popupImageUrl,
        facebook_pixel_id: s.facebookPixelId,
        facebook_capi_token: s.facebookCapiToken,
        google_analytics_id: s.googleAnalyticsId,
        google_tag_manager_id: s.googleTagManagerId,
        tiktok_pixel_id: s.tiktokPixelId,
        default_meta_title: s.defaultMetaTitle,
        default_meta_description: s.defaultMetaDescription,
        default_og_image_url: s.defaultOgImageUrl,
        homepage_blocks: s.homepageBlocks,
        delivery_inside_dhaka: s.deliveryInsideDhaka ? Number(s.deliveryInsideDhaka) : undefined,
        delivery_outside_dhaka: s.deliveryOutsideDhaka ? Number(s.deliveryOutsideDhaka) : undefined,
        free_delivery_threshold: s.freeDeliveryThreshold ? Number(s.freeDeliveryThreshold) : undefined,
        terms_url: s.termsUrl,
        privacy_url: s.privacyUrl,
        require_otp_phone_tracking: s.requireOtpPhoneTracking,
        review_eligible_days: s.reviewEligibleDays,
        auth_providers: s.authProviders,
        advanced_settings: s.advancedSettings,
        tools_extras: s.toolsExtras,
      };
      return NextResponse.json(data);
    } catch (err) {
      console.error("[api/admin/settings] GET Prisma error:", err);
      return NextResponse.json(EMPTY_SETTINGS);
    }
  }

  return NextResponse.json({ error: "Database not configured" }, { status: 503 });
}

/**
 * PATCH /api/admin/settings
 * Update TenantSettings. Prisma only.
 */
export async function PATCH(request: Request) {
  const auth = await requireAdminAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const raw = await request.json();

    const settingsSchema = z.object({
      storeName: z.string().min(1, "Store name is required"),
      supportEmail: z.string().email("Invalid email address"),
      supportPhone: z.string().optional(),
      deliveryCharge: z.number().min(0, "Delivery charge must be non-negative"),
      currency: z.string().min(1, "Currency is required"),
      logoUrl: z.string().url("Invalid URL").optional(),
    }).passthrough();

    const parsed = settingsSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", issues: parsed.error.issues }, { status: 400 });
    }
    const { ...updates } = parsed.data;

    if (isPrismaConfigured()) {
      const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      const map: Record<string, string> = {
        logo_url: "logoUrl", logo_dark_url: "logoDarkUrl", site_name_en: "siteNameEn",
        site_name_bn: "siteNameBn", tagline_en: "taglineEn", tagline_bn: "taglineBn",
        primary_color: "primaryColor", secondary_color: "secondaryColor", accent_color: "accentColor",
        font_family: "fontFamily", button_style: "buttonStyle", navbar_links: "navbarLinks",
        footer_text_en: "footerTextEn", footer_text_bn: "footerTextBn", footer_links: "footerLinks",
        copyright_text: "copyrightText", social_links: "socialLinks", address_en: "addressEn",
        address_bn: "addressBn", phone: "phone", email: "email", whatsapp_number: "whatsappNumber",
        sales_top_bar_text: "salesTopBarText", sales_top_bar_enabled: "salesTopBarEnabled", cta_buttons: "ctaButtons",
        popup_enabled: "popupEnabled", popup_content_en: "popupContentEn", popup_content_bn: "popupContentBn",
        popup_image_url: "popupImageUrl",         facebook_pixel_id: "facebookPixelId", facebook_capi_token: "facebookCapiToken",
        google_analytics_id: "googleAnalyticsId", google_tag_manager_id: "googleTagManagerId",
        tiktok_pixel_id: "tiktokPixelId",
        default_meta_title: "defaultMetaTitle", default_meta_description: "defaultMetaDescription",
        default_og_image_url: "defaultOgImageUrl", homepage_blocks: "homepageBlocks",
        delivery_inside_dhaka: "deliveryInsideDhaka", delivery_outside_dhaka: "deliveryOutsideDhaka",
        free_delivery_threshold: "freeDeliveryThreshold", terms_url: "termsUrl", privacy_url: "privacyUrl",
        require_otp_phone_tracking: "requireOtpPhoneTracking", review_eligible_days: "reviewEligibleDays",
        auth_providers: "authProviders", advanced_settings: "advancedSettings", tools_extras: "toolsExtras",
      };
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        const camel = map[k] ?? snakeToCamel(k);
        if (camel && v !== undefined) data[camel] = v;
      }
      const tenantId = getDefaultTenantId();
      const updated = await prisma.tenantSettings.upsert({
        where: { tenantId },
        create: { tenantId, ...data } as never,
        update: data as never,
      });
      revalidatePath("/");
      revalidatePath("/api/settings");

      await createAuditLog({
        userId: auth.userId,
        action: "update",
        resource: "tenant_settings",
        resourceId: tenantId,
        newValues: { keys: Object.keys(data) },
      });

      const out: Record<string, unknown> = { id: updated.tenantId, updated_at: updated.updatedAt.toISOString() };
      for (const [k, v] of Object.entries(updated)) {
        if (k === "updatedAt") continue;
        const snake = k.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
        out[snake] = v instanceof Date ? v.toISOString() : v;
      }
      return NextResponse.json(out);
    }

    return NextResponse.json({ error: "No database configured" }, { status: 500 });
  } catch (err) {
    console.error("[api/admin/settings] PATCH unexpected:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
