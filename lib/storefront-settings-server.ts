/**
 * Server-only: fetch storefront settings from Postgres.
 * Self-hosted: uses Prisma (replaces Supabase).
 */
import { prisma } from "@lib/db";
import { getDefaultTenantId } from "@lib/tenant";
import {
  getOrderedHomepageBlocks,
  type HomepageBlockConfig,
} from "@lib/commerce-settings";

export interface StorefrontSettings {
  homepageBlocks: HomepageBlockConfig[];
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const tenantId = getDefaultTenantId();
    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { homepageBlocks: true },
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
