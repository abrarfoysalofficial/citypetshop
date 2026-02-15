/**
 * Runtime config: data source and auth mode.
 * Supports new 3-source model with backward compatibility:
 * - NEXT_PUBLIC_PRODUCTS_SOURCE (sanity | local | auto) or legacy NEXT_PUBLIC_DATA_SOURCE
 * - NEXT_PUBLIC_AUTH_SOURCE (supabase | demo | auto) or legacy NEXT_PUBLIC_AUTH_MODE
 * - NEXT_PUBLIC_ENABLE_FALLBACKS (true | false)
 * Exports DATA_SOURCE and AUTH_MODE so existing code keeps working.
 */
import {
  getResolvedProductsSource,
  getResolvedAuthSource,
  getSiteUrl,
  isSanityConfigured,
  isSupabaseConfigured,
  getEnableFallbacks,
} from "./env";

export { getSiteUrl, isSanityConfigured, isSupabaseConfigured, getEnableFallbacks } from "./env";
export type { ProductsSource, AuthSource } from "./env";

/** Resolved products source for data layer: "sanity" | "local". */
export const PRODUCTS_SOURCE_RESOLVED = getResolvedProductsSource();

/** Resolved auth source: "supabase" | "demo". */
export const AUTH_SOURCE_RESOLVED = getResolvedAuthSource();

/**
 * Legacy: DATA_SOURCE for products/content.
 * "sanity" | "local" | "supabase"
 */
export const DATA_SOURCE: "local" | "sanity" | "supabase" =
  PRODUCTS_SOURCE_RESOLVED === "sanity"
    ? "sanity"
    : PRODUCTS_SOURCE_RESOLVED === "supabase"
      ? "supabase"
      : "local";

/**
 * Legacy: AUTH_MODE for auth. Same as AUTH_SOURCE_RESOLVED.
 */
export const AUTH_MODE: "demo" | "supabase" = getResolvedAuthSource();

export const IS_DEMO_MODE = AUTH_MODE === "demo";
