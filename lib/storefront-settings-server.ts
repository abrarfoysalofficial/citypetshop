/**
 * Server-only: fetch storefront settings (e.g. homepage blocks) from Supabase.
 * Cached 60s to reduce repeat requests and improve response time.
 */
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getOrderedHomepageBlocks,
  type HomepageBlockConfig,
} from "@/lib/commerce-settings";

export interface StorefrontSettings {
  homepageBlocks: HomepageBlockConfig[];
}

async function getStorefrontSettingsUncached(): Promise<StorefrontSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("homepage_blocks")
      .eq("id", "default")
      .single();

    const raw = (data as { homepage_blocks?: HomepageBlockConfig[] } | null)
      ?.homepage_blocks;
    const homepageBlocks = getOrderedHomepageBlocks(raw ?? null);
    return { homepageBlocks };
  } catch {
    return {
      homepageBlocks: getOrderedHomepageBlocks(null),
    };
  }
}

export const getStorefrontSettings = unstable_cache(
  getStorefrontSettingsUncached,
  ["storefront-settings"],
  { revalidate: 60 }
);
