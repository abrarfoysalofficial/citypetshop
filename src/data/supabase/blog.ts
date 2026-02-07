import type { BlogPost } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (DATA_SOURCE !== "supabase") return [];
  return [];
}

export async function getBlogPostBySlug(_slug: string): Promise<BlogPost | null> {
  if (DATA_SOURCE !== "supabase") return null;
  return null;
}
