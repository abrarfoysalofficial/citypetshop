"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { BlogPost } from "@/lib/content";
import { blogPosts as initialPosts } from "@/lib/content";

interface BlogContextValue {
  posts: BlogPost[];
  getPostBySlug: (slug: string) => BlogPost | undefined;
  addPost: (post: BlogPost) => void;
  updatePost: (oldSlug: string, post: BlogPost) => void;
  deletePost: (slug: string) => void;
  resetToDefault: () => void;
  lastUpdated: string | null;
}

const BlogContext = createContext<BlogContextValue | null>(null);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const persist = useCallback((next: BlogPost[]) => {
    setPosts(next);
    setLastUpdated(new Date().toISOString());
  }, []);

  const getPostBySlug = useCallback((slug: string) => posts.find((p) => p.slug === slug), [posts]);

  const addPost = useCallback(
    (post: BlogPost) => {
      if (posts.some((p) => p.slug === post.slug)) return;
      persist([...posts, post]);
    },
    [posts, persist]
  );

  const updatePost = useCallback(
    (oldSlug: string, post: BlogPost) => {
      persist(posts.map((p) => (p.slug === oldSlug ? post : p)));
    },
    [posts, persist]
  );

  const deletePost = useCallback(
    (slug: string) => persist(posts.filter((p) => p.slug !== slug)),
    [posts, persist]
  );

  const resetToDefault = useCallback(() => {
    persist(initialPosts);
  }, [persist]);

  const value: BlogContextValue = {
    posts,
    getPostBySlug,
    addPost,
    updatePost,
    deletePost,
    resetToDefault,
    lastUpdated,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const ctx = useContext(BlogContext);
  if (!ctx)
    return {
      posts: initialPosts,
      getPostBySlug: (slug: string) => initialPosts.find((p) => p.slug === slug),
      addPost: () => {},
      updatePost: () => {},
      deletePost: () => {},
      resetToDefault: () => {},
      lastUpdated: null,
    };
  return ctx;
}
