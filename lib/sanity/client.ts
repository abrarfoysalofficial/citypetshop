/**
 * Sanity client stub – not used in production (Prisma is source of truth).
 * Kept for reference only. Import nothing from this file in production code.
 */

export function getSanityClient() {
  throw new Error("Sanity is not configured. Use Prisma/PostgreSQL.");
}

export async function sanityFetch<T>(_options: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  throw new Error("Sanity is not configured. Use Prisma/PostgreSQL.");
}
