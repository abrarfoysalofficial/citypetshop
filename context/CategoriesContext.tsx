"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CategoryItem } from "@/lib/types";
import { categories as initialCategories } from "@/lib/data";

const STORAGE_KEY = "city-plus-pet-shop-categories";

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

function loadStored(): CategoryItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CategoryItem[];
  } catch {
    return null;
  }
}

function save(categories: CategoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategoriesState] = useState<CategoryItem[]>(initialCategories);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStored();
    if (stored && stored.length > 0) {
      setCategoriesState(stored);
      setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
    }
  }, []);

  const setCategories = useCallback((next: CategoryItem[]) => {
    setCategoriesState(next);
    save(next);
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
        save(next);
        setLastUpdated(new Date().toISOString());
        return next;
      });
    },
    [categories]
  );

  const updateCategory = useCallback((oldSlug: string, item: CategoryItem) => {
    setCategoriesState((prev) => {
      const next = prev.map((c) => (c.slug === oldSlug ? item : c));
      save(next);
      setLastUpdated(new Date().toISOString());
      return next;
    });
  }, []);

  const deleteCategory = useCallback((slug: string) => {
    setCategoriesState((prev) => {
      const next = prev.filter((c) => c.slug !== slug);
      save(next);
      setLastUpdated(new Date().toISOString());
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setCategoriesState(initialCategories);
    save(initialCategories);
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
