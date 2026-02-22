/**
 * Minimal Supabase blog stub – used only when DATA_SOURCE=supabase and Supabase configured.
 * Production uses Prisma (provider-db). This returns empty data when Supabase not used.
 */
import type { BlogPost } from "../types";

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [];
}

export async function getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
  return null;
}
