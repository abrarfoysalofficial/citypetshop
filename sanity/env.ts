/**
 * Sanity env. Uses fallbacks at build time so Next.js build does not crash
 * when optional env vars are missing. Runtime Studio requires real env for /studio.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "build-time-placeholder";
