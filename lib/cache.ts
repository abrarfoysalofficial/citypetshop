/**
 * Phase 1: HTTP cache headers helper.
 * Use in API routes and Server Components for intelligent caching.
 */

export const CACHE = {
  /** Static content: 1 hour */
  STATIC: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
  /** Product/category lists: 5 min */
  PRODUCT_LIST: "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
  /** Product detail: 5 min */
  PRODUCT_DETAIL: "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
  /** Homepage: 2 min */
  HOMEPAGE: "public, max-age=120, s-maxage=120, stale-while-revalidate=300",
  /** No cache (auth, checkout) */
  NONE: "no-store, no-cache, must-revalidate",
} as const;

export type CachePreset = keyof typeof CACHE;

export function getCacheHeader(preset: CachePreset): string {
  return CACHE[preset];
}

/**
 * Response headers for Cache-Control.
 */
export function cacheHeaders(preset: CachePreset): Record<string, string> {
  return {
    "Cache-Control": getCacheHeader(preset),
  };
}
