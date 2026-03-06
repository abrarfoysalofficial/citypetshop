"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { SiteSettingsRow } from "@/lib/schema";

const DEFAULT_SETTINGS: SiteSettingsRow = {
  id: "default",
  updated_at: new Date().toISOString(),
  logo_url: null,
  logo_dark_url: null,
  site_name_en: "City Plus Pet Shop",
  site_name_bn: null,
  tagline_en: "Your pet, our passion.",
  tagline_bn: null,
  primary_color: "#0f172a",
  secondary_color: "#06b6d4",
  accent_color: "#f97316",
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

interface SiteSettingsContextValue {
  settings: SiteSettingsRow | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsRow | null>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (!res.ok) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }
      const data = await res.json();
      setSettings(data != null ? (data as SiteSettingsRow) : DEFAULT_SETTINGS);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load settings"));
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value: SiteSettingsContextValue = {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}
