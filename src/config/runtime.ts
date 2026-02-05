/**
 * Runtime config: data source and auth mode.
 * - NEXT_PUBLIC_DATA_SOURCE=local | supabase | sanity (default: supabase in prod, local in dev)
 * - NEXT_PUBLIC_AUTH_MODE=demo | supabase (default: supabase in prod, demo in dev)
 * Production: use Supabase by default; demo only when explicitly set via env.
 */
export const DATA_SOURCE =
  (process.env.NEXT_PUBLIC_DATA_SOURCE as "local" | "supabase" | "sanity") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "local");

export const AUTH_MODE =
  (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ??
  (process.env.NODE_ENV === "production" ? "supabase" : "demo");

export const IS_DEMO_MODE = AUTH_MODE === "demo";
