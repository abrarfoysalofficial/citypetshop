/**
 * Commerce settings: homepage blocks, low-stock threshold, delivery copy, etc.
 * All values are admin-configurable; no hardcoded business logic.
 */

export type HomepageBlockType = "featured" | "featured_brands" | "flash_sale" | "clearance" | "combo_offers" | "reviews";

export interface HomepageBlockConfig {
  id: string;
  type: HomepageBlockType;
  enabled: boolean;
  order: number;
  titleEn?: string;
  titleBn?: string;
  subtitle?: string;
}

/** Default block order and labels when Admin has not configured. */
export const DEFAULT_HOMEPAGE_BLOCKS: HomepageBlockConfig[] = [
  { id: "featured", type: "featured", enabled: true, order: 0, titleEn: "Most Popular Products", subtitle: "Bestsellers and new arrivals for your pets." },
  { id: "featured_brands", type: "featured_brands", enabled: true, order: 1, titleEn: "Featured Brands", subtitle: "Trusted brands for your pets." },
  { id: "flash_sale", type: "flash_sale", enabled: true, order: 2, titleEn: "Flash Sale", subtitle: "Limited time offers." },
  { id: "clearance", type: "clearance", enabled: true, order: 3, titleEn: "Clearance", subtitle: "Great deals while stocks last." },
  { id: "combo_offers", type: "combo_offers", enabled: true, order: 4, titleEn: "Combo Offers", subtitle: "Bundle and save." },
  { id: "reviews", type: "reviews", enabled: true, order: 5, titleEn: "Customer Reviews", subtitle: "What our customers say." },
];

/** Low stock threshold – below this show "Only X left". Admin-editable. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

/** Default delivery ETA copy when not set in Admin. */
export const DEFAULT_DELIVERY_ETA_INSIDE = "2–4 business days";
export const DEFAULT_DELIVERY_ETA_OUTSIDE = "4–7 business days";

/**
 * Normalize and sort blocks from Admin (or default). Returns only enabled blocks in order.
 */
export function getOrderedHomepageBlocks(blocks: HomepageBlockConfig[] | null | undefined): HomepageBlockConfig[] {
  const list = Array.isArray(blocks) && blocks.length > 0
    ? blocks
    : DEFAULT_HOMEPAGE_BLOCKS;
  return list
    .filter((b) => b.enabled)
    .sort((a, b) => a.order - b.order);
}
