"use client";

import { useState, useMemo } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Save, Palette, Globe, FileText, Code } from "lucide-react";
import {
  DEFAULT_HOMEPAGE_BLOCKS,
  getOrderedHomepageBlocks,
  type HomepageBlockConfig,
} from "@/lib/commerce-settings";
import type { SiteSettingsRow } from "@/lib/schema";

function HomepageBlocksEditor({ settings }: { settings: SiteSettingsRow }) {
  const initialBlocks = useMemo(
    () =>
      (settings.homepage_blocks && settings.homepage_blocks.length > 0
        ? settings.homepage_blocks
        : DEFAULT_HOMEPAGE_BLOCKS
      ).slice().sort((a, b) => a.order - b.order),
    [settings.homepage_blocks]
  );
  const [blocks, setBlocks] = useState<HomepageBlockConfig[]>(initialBlocks);
  const [saved, setSaved] = useState(false);

  const toggleEnabled = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const setOrder = (id: string, order: number) => {
    const n = Math.max(0, Math.min(blocks.length - 1, order));
    setBlocks((prev) => {
      const out = prev.map((b) => (b.id === id ? { ...b, order: n } : b));
      out.sort((a, b) => a.order - b.order);
      return out.map((b, i) => ({ ...b, order: i }));
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // TODO: persist to Supabase via API when connected
  };

  const blockLabels: Record<string, string> = {
    featured: "Featured Products",
    featured_brands: "Featured Brands",
    flash_sale: "Flash Sale",
    clearance: "Clearance",
    combo_offers: "Combo Offers",
    reviews: "Customer Reviews",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">
        Homepage dynamic blocks
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Reorder and enable/disable sections. Order is 0-based. Changes apply when
        Supabase is connected and saved.
      </p>
      <ul className="space-y-3">
        {blocks.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={b.enabled}
                onChange={() => toggleEnabled(b.id)}
                className="rounded border-slate-300"
              />
              <span className="font-medium text-slate-900">
                {blockLabels[b.type] ?? b.type}
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Order:
              <input
                type="number"
                min={0}
                max={blocks.length - 1}
                value={b.order}
                onChange={(e) => setOrder(b.id, parseInt(e.target.value, 10) || 0)}
                className="w-16 rounded border border-slate-300 px-2 py-1"
              />
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleSave}
        className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        <Save className="h-4 w-4" />
        {saved ? "Saved" : "Save block order"}
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { settings, loading } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<"store" | "theme" | "homepage" | "integrations" | "seo">("store");

  if (loading || !settings) {
    return <div className="text-slate-600">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Site Settings (CMS-Style Customization)</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: "store", label: "Store details", icon: FileText },
          { id: "theme", label: "Theme Customizer", icon: Palette },
          { id: "homepage", label: "Homepage Builder", icon: Globe },
          { id: "integrations", label: "Integrations", icon: Code },
          { id: "seo", label: "SEO Defaults", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Store details */}
      {activeTab === "store" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Store details</h2>
          <p className="mb-4 text-sm text-slate-600">Details about the store shown in email receipts and invoices.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Store name</label>
              <input type="text" defaultValue="City Plus Pet Shop" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-slate-500">The name of your physical store.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Physical address</label>
              <textarea rows={4} defaultValue="Mirpur 2, Borobag\nDhaka\n1216" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone number</label>
              <input type="text" defaultValue="+880 1643-390045" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" defaultValue="info@citypluspetshop.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-slate-500">Your store contact email.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Refund &amp; Returns Policy</label>
              <textarea rows={4} placeholder="Paste or link to your refund policy..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      )}

      {/* Theme Customizer */}
      {activeTab === "theme" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Theme Customizer</h2>
          <p className="mb-4 text-sm text-slate-600">
            Change Primary Color, Secondary Color, Font, and Button Styles. Values reflect on the frontend.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Primary Color</label>
              <input
                type="text"
                defaultValue={settings.primary_color}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="#0f172a"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Secondary Color</label>
              <input
                type="text"
                defaultValue={settings.secondary_color}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="#06b6d4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Accent Color</label>
              <input
                type="text"
                defaultValue={settings.accent_color}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="#f97316"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Button Style</label>
              <select
                defaultValue={settings.button_style ?? "rounded"}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      )}

      {/* Integrations */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Auth Providers</h2>
            <p className="mb-4 text-sm text-slate-600">
              Enable login methods when AUTH_MODE=supabase. Configure Google/Facebook OAuth and Phone (Twilio) in Supabase Dashboard → Auth → Providers. Env overrides: NEXT_PUBLIC_AUTH_GOOGLE, NEXT_PUBLIC_AUTH_FACEBOOK, NEXT_PUBLIC_AUTH_PHONE.
            </p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={settings.auth_providers?.google ?? true} className="rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Google</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={settings.auth_providers?.facebook ?? true} className="rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Facebook</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked={settings.auth_providers?.phone ?? true} className="rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">Phone OTP (Bangladesh)</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">Persist to site_settings.auth_providers when Supabase is connected. Until then, env vars control visibility.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Analytics & Tracking</h2>
            <p className="mb-4 text-sm text-slate-600">
              GTM, Cloudflare Web Analytics, Facebook Pixel. Set env vars for immediate effect: NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_ENABLE_GTM, NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN, NEXT_PUBLIC_ENABLE_CF_ANALYTICS.
            </p>
            <div className="grid gap-4 sm:grid-cols-1">
              <div>
                <label className="block text-sm font-medium text-slate-700">Google Tag Manager ID</label>
                <input
                  type="text"
                  defaultValue={settings.google_tag_manager_id ?? ""}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="GTM-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Google Analytics ID</label>
                <input
                  type="text"
                  defaultValue={settings.google_analytics_id ?? ""}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cloudflare Web Analytics Token</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Use NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN"
                  disabled
                />
                <p className="mt-0.5 text-xs text-slate-500">Set via env. Supabase storage for token coming soon.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Facebook Pixel ID</label>
                <input
                  type="text"
                  defaultValue={settings.facebook_pixel_id ?? ""}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Pixel ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Facebook CAPI Token</label>
                <input
                  type="password"
                  defaultValue={settings.facebook_capi_token ?? ""}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Conversion API Token"
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Tracking</h2>
            <p className="mb-4 text-sm text-slate-600">
              When enabled, phone-based order tracking requires OTP verification. Order ID lookup remains available.
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={(settings as { require_otp_phone_tracking?: boolean })?.require_otp_phone_tracking ?? false}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Require OTP for phone-based tracking</span>
            </label>
            <p className="mt-2 text-xs text-slate-500">Persist to site_settings.require_otp_phone_tracking when Supabase is connected.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Social Links</h2>
            <p className="mb-4 text-sm text-slate-600">
              Facebook, Instagram, YouTube. Shown in footer. Or set NEXT_PUBLIC_SOCIAL_FACEBOOK, NEXT_PUBLIC_SOCIAL_INSTAGRAM, NEXT_PUBLIC_SOCIAL_YOUTUBE.
            </p>
            <div className="grid gap-4 sm:grid-cols-1">
              {(settings.social_links ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No social links in settings. Use env vars or add via Supabase site_settings.social_links.</p>
              ) : (
                settings.social_links?.map((l, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-slate-700">{l.platform}</label>
                    <input
                      type="url"
                      defaultValue={l.url}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <button className="flex gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      )}

      {activeTab === "homepage" && (
        <HomepageBlocksEditor settings={settings} />
      )}

      {activeTab === "seo" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">SEO Defaults</h2>
          <p className="text-sm text-slate-600">
            Default Meta Title, Description, OG Image. Managed from Admin for every page.
          </p>
        </div>
      )}
    </div>
  );
}
