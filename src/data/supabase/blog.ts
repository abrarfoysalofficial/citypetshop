import type { BlogPost } from "../types";
import { DATA_SOURCE } from "@/src/config/runtime";

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (DATA_SOURCE !== "supabase") throw new Error("Supabase not enabled");
  return null;
}
