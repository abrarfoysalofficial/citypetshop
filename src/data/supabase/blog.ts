import type { BlogPost } from "../types";
import { isSupabaseConfigured } from "@/src/config/env";

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  return [];
}

export async function getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  return null;
}
