"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CategoryItem } from "@/lib/types";
import { categories as initialCategories } from "@/lib/data";

interface CategoriesContextValue {
  categories: CategoryItem[];
  getCategoryBySlug: (slug: string) => CategoryItem | undefined;
  navCategories: { slug: string; name: string }[];
  addCategory: (item: CategoryItem) => void;
  updateCategory: (oldSlug: string, item: CategoryItem) => void;
  deleteCategory: (slug: string) => void;
  setCategories: (items: CategoryItem[]) => void;
  resetToDefault: () => void;
  lastUpdated: string | null;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategoriesState] = useState<CategoryItem[]>(initialCategories);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
    },
    [categories]
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
    setCategoriesState(initialCategories);
    setLastUpdated(new Date().toISOString());
  }, []);

  const value: CategoriesContextValue = {
    categories,
    getCategoryBySlug,
    navCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    setCategories,
    resetToDefault,
    lastUpdated,
  };

  return (
    <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: initialCategories,
      getCategoryBySlug: (slug: string) => initialCategories.find((c) => c.slug === slug),
      navCategories: initialCategories.map((c) => ({ slug: c.slug, name: c.name })),
      addCategory: () => {},
      updateCategory: () => {},
      deleteCategory: () => {},
      setCategories: () => {},
      resetToDefault: () => {},
      lastUpdated: null,
    };
  }
  return ctx;
}
