/**
 * Server-only: fetch storefront settings from Postgres.
 * Self-hosted: uses Prisma (replaces Supabase).
 */
import { prisma } from "@/lib/db";
import {
  getOrderedHomepageBlocks,
  type HomepageBlockConfig,
} from "@/lib/commerce-settings";

export interface StorefrontSettings {
  homepageBlocks: HomepageBlockConfig[];
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    const raw = settings?.homepageBlocks as HomepageBlockConfig[] | null | undefined;
    const homepageBlocks = getOrderedHomepageBlocks(raw ?? null);
    return { homepageBlocks };
  } catch {
    return {
      homepageBlocks: getOrderedHomepageBlocks(null),
    };
  }
}
