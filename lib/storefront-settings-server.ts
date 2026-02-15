/**
 * Server-only: fetch storefront settings (e.g. homepage blocks) from Supabase.
 * No unstable_cache - avoids cookies-in-cache build error when Supabase is used.
 */
import { createAnonClient } from "@/lib/supabase/server";
import {
  getOrderedHomepageBlocks,
  type HomepageBlockConfig,
} from "@/lib/commerce-settings";

export interface StorefrontSettings {
  homepageBlocks: HomepageBlockConfig[];
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const supabase = createAnonClient();
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
