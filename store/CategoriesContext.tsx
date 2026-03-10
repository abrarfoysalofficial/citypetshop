"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CategoryItem } from "@/lib/types";

type ApiCategory = { id: string; slug: string; name: string; nameBn?: string | null; parentId?: string | null; parentSlug?: string | null };

export type MegaMenuCategory = {
  slug: string;
  name: string;
  subcategories: { slug: string; fullSlug: string; name: string }[];
};

interface CategoriesContextValue {
  categories: CategoryItem[];
  categoriesTree: MegaMenuCategory[];
  getCategoryBySlug: (slug: string) => CategoryItem | undefined;
  navCategories: { slug: string; name: string }[];
  addCategory: (item: CategoryItem) => void;
  updateCategory: (oldSlug: string, item: CategoryItem) => void;
  deleteCategory: (slug: string) => void;
  setCategories: (items: CategoryItem[]) => void;
  resetToDefault: () => void;
  lastUpdated: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const EMPTY_CATEGORIES: CategoryItem[] = [];
const EMPTY_TREE: MegaMenuCategory[] = [];

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

function buildTreeFromFlat(flat: ApiCategory[]): MegaMenuCategory[] {
  const topLevel = flat.filter((c) => !c.parentId);
  const children = flat.filter((c) => c.parentId);
  return topLevel.map((parent) => {
    const subs = children
      .filter((c) => c.parentId === parent.id)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        fullSlug: `${parent.slug}/${c.slug}`,
      }));
    return { slug: parent.slug, name: parent.name, subcategories: subs };
  });
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategoriesState] = useState<CategoryItem[]>(EMPTY_CATEGORIES);
  const [categoriesTree, setCategoriesTree] = useState<MegaMenuCategory[]>(EMPTY_TREE);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) {
        setCategoriesState(EMPTY_CATEGORIES);
        setCategoriesTree(EMPTY_TREE);
        return;
      }
      const data: ApiCategory[] = await res.json();
      const items: CategoryItem[] = data.map((c) => ({ slug: c.slug, name: c.name }));
      setCategoriesState(items);
      setCategoriesTree(buildTreeFromFlat(data));
      setLastUpdated(new Date().toISOString());
    } catch {
      setCategoriesState(EMPTY_CATEGORIES);
      setCategoriesTree(EMPTY_TREE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const onCategoriesUpdated = () => fetchCategories();
    window.addEventListener("categories-updated", onCategoriesUpdated);
    return () => window.removeEventListener("categories-updated", onCategoriesUpdated);
  }, [fetchCategories]);

  const setCategories = useCallback((next: CategoryItem[]) => {
    setCategoriesState(next);
    setLastUpdated(new Date().toISOString());
  }, []);

  const getCategoryBySlug = useCallback(
    (slug: string) => categories.find((c) => c.slug === slug),
    [categories]
  );

  const navCategories = categories.map((c) => ({ slug: c.slug, name: c.name }));

  const addCategory = useCallback(
    (item: CategoryItem) => {
      if (categories.some((c) => c.slug === item.slug)) return;
      setCategoriesState((prev) => {
        const next = [...prev, item];
        setLastUpdated(new Date().toISOString());
        return next;
      });
      fetchCategories();
    },
    [categories, fetchCategories]
  );

  const updateCategory = useCallback((oldSlug: string, item: CategoryItem) => {
    setCategoriesState((prev) => {
      const next = prev.map((c) => (c.slug === oldSlug ? item : c));
      setLastUpdated(new Date().toISOString());
      return next;
    });
  }, []);

  const deleteCategory = useCallback((slug: string) => {
    setCategoriesState((prev) => {
      const next = prev.filter((c) => c.slug !== slug);
      setLastUpdated(new Date().toISOString());
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value: CategoriesContextValue = {
    categories,
    categoriesTree,
    getCategoryBySlug,
    navCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    resetToDefault,
    lastUpdated,
    loading,
    refetch: fetchCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: EMPTY_CATEGORIES,
      categoriesTree: EMPTY_TREE,
      getCategoryBySlug: (_slug: string) => undefined,
      navCategories: [] as { slug: string; name: string }[],
      addCategory: () => {},
      updateCategory: () => {},
      deleteCategory: () => {},
      setCategories: () => {},
      resetToDefault: () => {},
      lastUpdated: null,
      loading: false,
      refetch: async () => {},
    };
  }
  return ctx;
}
