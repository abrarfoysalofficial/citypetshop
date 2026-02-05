/**
 * Sanity config with safe env validation.
 * Used by client and image builder. Does not throw at module load;
 * getConfig() throws only when Sanity is actually used with missing env.
 */

export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn: boolean;
}

const DEFAULT_DATASET = "production";
const DEFAULT_API_VERSION = "2024-01-01";

let cachedConfig: SanityConfig | null = null;

/**
 * Returns validated Sanity config. Throws a clear error if required env vars
 * are missing (so the app does not crash silently when DATA_SOURCE=sanity).
 */
export function getSanityConfig(): SanityConfig {
  if (cachedConfig) return cachedConfig;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? DEFAULT_DATASET;
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? DEFAULT_API_VERSION;
  const useCdn = process.env.NODE_ENV === "production";

  if (!projectId || typeof projectId !== "string" || !projectId.trim()) {
    throw new Error(
      "[Sanity] Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Add it to .env.local when using DATA_SOURCE=sanity. See .env.example."
    );
  }

  cachedConfig = {
    projectId: projectId.trim(),
    dataset: dataset.trim() || DEFAULT_DATASET,
    apiVersion: apiVersion.trim() || DEFAULT_API_VERSION,
    useCdn,
  };
  return cachedConfig;
}

/**
 * Safe check: returns true only if Sanity env is present and valid.
 * Use this to avoid calling getSanityConfig() when Sanity is not configured.
 */
export function isSanityConfigured(): boolean {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  return typeof id === "string" && id.trim().length > 0;
}
