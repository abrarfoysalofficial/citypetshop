/**
 * Premium Digital Pet Shop - Supabase Database Schema
 * TypeScript types and table definitions for Admin-customizable e-commerce.
 * All tables support English + Bangla content where applicable.
 */

// =============================================================================
// SITE SETTINGS (Global config - Admin changes reflect on frontend)
// =============================================================================

export interface SiteSettingsRow {
  id: string;
  updated_at: string;

  // Brand
  logo_url: string | null;
  logo_dark_url: string | null;
  site_name_en: string;
  site_name_bn: string | null;
  tagline_en: string | null;
  tagline_bn: string | null;

  // Theme (Theme Customizer)
  primary_color: string;       // e.g. #0f172a
  secondary_color: string;    // e.g. #06b6d4
  accent_color: string;       // e.g. #f97316
  font_family: string | null;
  button_style: string | null; // rounded | pill | square

  // Navbar
  navbar_links: NavbarLink[];  // JSONB: { href, label_en, label_bn }

  // Footer
  footer_text_en: string | null;
  footer_text_bn: string | null;
  footer_links: FooterLink[];  // JSONB
  copyright_text: string | null;

  // Social & Contact
  social_links: SocialLink[];  // JSONB: { platform, url }
  address_en: string | null;
  address_bn: string | null;
  phone: string | null;
  email: string | null;
  whatsapp_number: string | null;

  // Homepage Builder (CMS-style)
  hero_slider: HeroSlide[];    // JSONB: { image_url, title_en, title_bn, link, order }
  side_banners: SideBanner[];  // JSONB: { image_url, title_en, link, cta_text }
  cta_buttons: CTAButton[];   // JSONB
  popup_enabled: boolean;
  popup_content_en: string | null;
  popup_content_bn: string | null;
  popup_image_url: string | null;

  // Integrations (Integration Fields)
  facebook_pixel_id: string | null;
  facebook_capi_token: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;

  // Auth providers (Admin toggles: Google, Facebook, Phone OTP)
  auth_providers: AuthProvidersConfig | null;

  // SEO Defaults
  default_meta_title: string | null;
  default_meta_description: string | null;
  default_og_image_url: string | null;

  // Homepage dynamic blocks (order + enable/disable) – enterprise upgrade
  homepage_blocks: HomepageBlockConfig[] | null;
}

export interface AuthProvidersConfig {
  google: boolean;
  facebook: boolean;
  phone: boolean;
}

/** Admin-controlled homepage section: type, order, enabled, optional titles. */
export interface HomepageBlockConfig {
  id: string;
  type: "featured" | "flash_sale" | "clearance" | "combo_offers";
  enabled: boolean;
  order: number;
  titleEn?: string;
  titleBn?: string;
  subtitle?: string;
}

export interface NavbarLink {
  href: string;
  label_en: string;
  label_bn?: string;
}

export interface FooterLink {
  href: string;
  label_en: string;
  label_bn?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface HeroSlide {
  image_url: string;
  title_en: string;
  title_bn?: string;
  link: string;
  order: number;
}

export interface SideBanner {
  image_url: string;
  title_en: string;
  title_bn?: string;
  link: string;
  cta_text: string;
}

export interface CTAButton {
  label: string;
  href: string;
  style?: string;
}

// =============================================================================
// PRODUCTS
// =============================================================================

export interface ProductRow {
  id: string;
  created_at: string;
  updated_at: string;

  name_en: string;
  name_bn: string | null;
  slug: string;
  description_en: string | null;
  description_bn: string | null;

  buying_price: number;   // BDT
  selling_price: number; // BDT
  stock: number;
  weight_kg: number | null;
  sku: string | null;

  category_slug: string;
  images: string[];      // array of URLs (Supabase Storage or external)
  is_featured: boolean;
  is_active: boolean;

  seo_title: string | null;
  seo_description: string | null;
  seo_tags: string[] | null;
  meta_og_image: string | null;
}

// =============================================================================
// ORDERS
// =============================================================================

export type OrderStatus =
  | "pending"
  | "processing"
  | "handed_to_courier"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderRow {
  id: string;
  created_at: string;
  updated_at: string;

  user_id: string | null;   // null for guest
  guest_email: string | null;
  guest_phone: string | null;
  guest_name: string | null;

  status: OrderStatus;
  subtotal: number;        // BDT
  delivery_charge: number;
  discount_amount: number; // voucher
  total: number;

  payment_method: string;  // cod | bkash | nagad | sslcommerz
  payment_status: string; // pending | paid | failed | refunded
  payment_meta: Record<string, unknown> | null;

  shipping_name: string;
  shipping_phone: string;
  shipping_email: string | null;
  shipping_address: string;
  shipping_city: string;   // Dhaka | Outside Dhaka (for delivery charge logic)
  shipping_area: string | null;
  shipping_notes: string | null;

  courier_provider: string | null;  // steadfast | pathao | redx
  courier_booking_id: string | null;
  tracking_code: string | null;
  delivery_method: string | null;
  rider_note: string | null;

  voucher_code: string | null;
  order_items: OrderItemRow[];
}

export interface OrderItemRow {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
}

// =============================================================================
// COURIER CONFIGS (API keys - Admin only)
// =============================================================================

export interface CourierConfigRow {
  id: string;
  created_at: string;
  updated_at: string;

  provider: string;  // steadfast | pathao | redx
  is_active: boolean;
  api_key: string | null;
  api_secret: string | null;
  api_url: string | null;
  config_json: Record<string, unknown> | null;
}

// =============================================================================
// PAYMENT GATEWAYS
// =============================================================================

export interface PaymentGatewayRow {
  id: string;
  created_at: string;
  updated_at: string;

  gateway: string;  // bkash | nagad | sslcommerz
  is_active: boolean;
  display_name_en: string;
  display_name_bn: string | null;
  credentials_json: Record<string, unknown> | null; // encrypted or env-ref
}

// =============================================================================
// VOUCHERS
// =============================================================================

export interface VoucherRow {
  id: string;
  created_at: string;
  updated_at: string;

  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;   // BDT or %
  min_order_amount: number | null;
  expiry_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
}

// =============================================================================
// TEAM MEMBERS (Admin Panel roles)
// =============================================================================

export type TeamRole = "admin" | "editor" | "support";

export interface TeamMemberRow {
  id: string;
  created_at: string;
  updated_at: string;

  user_id: string;  // Supabase Auth UUID
  email: string;
  role: TeamRole;
  full_name: string | null;
  is_active: boolean;
}

// =============================================================================
// ANALYTICS (Custom event logs for local reporting)
// =============================================================================

export interface AnalyticsRow {
  id: string;
  created_at: string;

  event_type: string;  // page_view | add_to_cart | purchase | etc.
  session_id: string | null;
  user_id: string | null;
  payload: Record<string, unknown> | null;

  page_url: string | null;
  referrer: string | null;
  device_type: string | null;
}

// =============================================================================
// ACTIVITY LOG (Audit - Recent Activities in Admin)
// =============================================================================

export interface ActivityLogRow {
  id: string;
  created_at: string;

  actor_type: string;  // user | admin | system
  actor_id: string | null;
  actor_name: string | null;

  action: string;      // order_placed | product_updated | price_changed | etc.
  entity_type: string | null;  // order | product | settings
  entity_id: string | null;
  details: Record<string, unknown> | null;
}

// =============================================================================
// CMS PAGES (Blog, About, Legal - managed from Admin)
// =============================================================================

export interface CmsPageRow {
  id: string;
  created_at: string;
  updated_at: string;

  slug: string;  // about-us | privacy-policy | refund-policy | terms | blog-post-slug
  title_en: string;
  title_bn: string | null;
  content_en: string | null;
  content_bn: string | null;
  excerpt_en: string | null;
  excerpt_bn: string | null;

  is_published: boolean;
  published_at: string | null;
  template: string | null;  // page | blog | legal

  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
}

// =============================================================================
// HELPER TYPES FOR FRONTEND
// =============================================================================

export type Database = {
  public: {
    Tables: {
      site_settings: { Row: SiteSettingsRow; Insert: Partial<SiteSettingsRow>; Update: Partial<SiteSettingsRow> };
      products: { Row: ProductRow; Insert: Partial<ProductRow>; Update: Partial<ProductRow> };
      orders: { Row: OrderRow; Insert: Partial<OrderRow>; Update: Partial<OrderRow> };
      courier_configs: { Row: CourierConfigRow; Insert: Partial<CourierConfigRow>; Update: Partial<CourierConfigRow> };
      payment_gateways: { Row: PaymentGatewayRow; Insert: Partial<PaymentGatewayRow>; Update: Partial<PaymentGatewayRow> };
      vouchers: { Row: VoucherRow; Insert: Partial<VoucherRow>; Update: Partial<VoucherRow> };
      team_members: { Row: TeamMemberRow; Insert: Partial<TeamMemberRow>; Update: Partial<TeamMemberRow> };
      analytics: { Row: AnalyticsRow; Insert: Partial<AnalyticsRow> };
      activity_log: { Row: ActivityLogRow; Insert: Partial<ActivityLogRow> };
      cms_pages: { Row: CmsPageRow; Insert: Partial<CmsPageRow>; Update: Partial<CmsPageRow> };
    };
  };
};
