/**
 * Central env + mode config with backward compatibility.
 * - New: NEXT_PUBLIC_PRODUCTS_SOURCE, NEXT_PUBLIC_AUTH_SOURCE, NEXT_PUBLIC_ENABLE_FALLBACKS
 * - Legacy: NEXT_PUBLIC_DATA_SOURCE -> products, NEXT_PUBLIC_AUTH_MODE -> auth
 * Build never fails due to missing env; runtime uses fallbacks when appropriate.
 */

export type ProductsSource = "sanity" | "local" | "auto";
export type AuthSource = "supabase" | "demo" | "auto";

function getEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env[key];
  return typeof v === "string" ? v.trim() || undefined : undefined;
}

/** NEXT_PUBLIC_SITE_URL – required in prod; safe for build. */
export function getSiteUrl(): string {
  return getEnv("NEXT_PUBLIC_SITE_URL") ?? "";
}

/** True if Sanity project ID is set (non-empty). */
export function isSanityConfigured(): boolean {
  const id = getEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  return !!id;
}

/** Sanity project ID (for status panel; empty if not set). */
export function getSanityProjectId(): string {
  return getEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") ?? "";
}

/** Sanity dataset (for status panel; default production). */
export function getSanityDataset(): string {
  return getEnv("NEXT_PUBLIC_SANITY_DATASET") ?? "production";
}

/** True if Supabase URL and anon key are set. */
export function isSupabaseConfigured(): boolean {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return !!(url && key);
}

/** Resolved products source: sanity | local | auto. Backward compat: DATA_SOURCE maps to products. */
export function getProductsSource(): ProductsSource {
  const productsSource = getEnv("NEXT_PUBLIC_PRODUCTS_SOURCE") as ProductsSource | undefined;
  const legacyDataSource = getEnv("NEXT_PUBLIC_DATA_SOURCE") as "sanity" | "local" | "supabase" | undefined;

  if (productsSource === "sanity" || productsSource === "local" || productsSource === "auto") {
    return productsSource;
  }
  if (legacyDataSource === "sanity" || legacyDataSource === "local") {
    return legacyDataSource;
  }
  if (legacyDataSource === "supabase") {
    return "local";
  }
  return process.env.NODE_ENV === "production" ? "auto" : "local";
}

/** Resolved auth source: supabase | demo | auto. Backward compat: AUTH_MODE maps. */
export function getAuthSource(): AuthSource {
  const authSource = getEnv("NEXT_PUBLIC_AUTH_SOURCE") as AuthSource | undefined;
  const legacyAuthMode = getEnv("NEXT_PUBLIC_AUTH_MODE") as "supabase" | "demo" | undefined;

  if (authSource === "supabase" || authSource === "demo" || authSource === "auto") {
    return authSource;
  }
  if (legacyAuthMode === "supabase" || legacyAuthMode === "demo") {
    return legacyAuthMode;
  }
  return process.env.NODE_ENV === "production" ? "auto" : "demo";
}

/** NEXT_PUBLIC_ENABLE_FALLBACKS: "true" | "false"; default true. */
export function getEnableFallbacks(): boolean {
  const v = getEnv("NEXT_PUBLIC_ENABLE_FALLBACKS");
  if (v === "false" || v === "0") return false;
  return true;
}

/** Resolved "effective" products source after auto/fallback: "sanity" | "local". */
export function getResolvedProductsSource(): "sanity" | "local" {
  const source = getProductsSource();
  const fallbacks = getEnableFallbacks();
  if (source === "sanity") return "sanity";
  if (source === "local") return "local";
  if (source === "auto" && fallbacks && isSanityConfigured()) return "sanity";
  return "local";
}

/** Resolved "effective" auth source after auto/fallback: "supabase" | "demo". */
export function getResolvedAuthSource(): "supabase" | "demo" {
  const source = getAuthSource();
  const fallbacks = getEnableFallbacks();
  if (source === "supabase") return "supabase";
  if (source === "demo") return "demo";
  if (source === "auto" && fallbacks && isSupabaseConfigured()) return "supabase";
  return "demo";
}
