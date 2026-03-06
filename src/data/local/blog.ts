/**
 * Local blog – used when DATA_SOURCE is not prisma or DB not configured.
 * Returns static Phase 3 posts so /blog always shows 5 posts for verification.
 */
import type { BlogPost } from "../types";
import { STATIC_BLOG_POSTS } from "../blog-posts-static";

export async function getBlogPosts(): Promise<BlogPost[]> {
  return STATIC_BLOG_POSTS;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return STATIC_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
