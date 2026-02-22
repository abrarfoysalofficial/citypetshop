/**
 * Minimal local blog stub – used only when DATA_SOURCE=local|sanity.
 * Production uses Prisma (provider-db). This returns empty data for dev/fallback.
 */
import type { BlogPost } from "../types";

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [];
}

export async function getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
  return null;
}
