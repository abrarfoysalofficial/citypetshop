"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { BlogPost } from "@/lib/content";
import { blogPosts as initialPosts } from "@/lib/content";

const STORAGE_KEY = "city-plus-pet-shop-blog";

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

function loadStored(): BlogPost[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BlogPost[];
  } catch {
    return null;
  }
}

function save(posts: BlogPost[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStored();
    if (stored && stored.length > 0) {
      setPosts(stored);
      setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
    }
  }, []);

  const persist = useCallback((next: BlogPost[]) => {
    setPosts(next);
    save(next);
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
