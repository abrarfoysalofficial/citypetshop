import { createClient } from "next-sanity";
import { getSanityConfig } from "./config";

/**
 * Sanity client for Next.js 14 App Router.
 * Uses validated config; compatible with ISR and cache tags.
 */
function createSanityClient() {
  const { projectId, dataset, apiVersion, useCdn } = getSanityConfig();
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
  });
}

let clientInstance: ReturnType<typeof createSanityClient> | null = null;

/**
 * Shared Sanity client. Lazy-initialized so getSanityConfig() runs only when
 * Sanity is first used (avoids throwing at build time if env is missing).
 */
export function getSanityClient() {
  if (!clientInstance) clientInstance = createSanityClient();
  return clientInstance;
}

/**
 * Fetch with Next.js cache tags for on-demand revalidation (ISR).
 * When tags are provided, time-based revalidate is not used (Next.js constraint).
 */
export async function sanityFetch<T>(options: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  const client = getSanityClient();
  const { query, params, tags, revalidate } = options;
  const nextOptions =
    tags?.length
      ? { next: { tags, revalidate: false as const } }
      : revalidate != null
        ? { next: { revalidate } }
        : undefined;
  return client.fetch<T>(
    query,
    params ?? {},
    nextOptions as { next?: { revalidate: number; tags?: string[] } }
  );
}
