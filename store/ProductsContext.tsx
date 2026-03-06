"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product } from "@/lib/types";
import { products as initialProducts } from "@/lib/data";

interface ProductsContextValue {
  products: Product[];
  addProducts: (rows: Omit<Product, "id">[]) => void;
  setProducts: (products: Product[]) => void;
  resetToDefault: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(initialProducts);

  const setProducts = useCallback((next: Product[]) => {
    setProductsState(next);
  }, []);

  const addProducts = useCallback((rows: Omit<Product, "id">[]) => {
    setProductsState((prev) => {
      const maxId = prev.reduce((m, p) => {
        const n = parseInt(p.id, 10);
        return Number.isNaN(n) ? m : Math.max(m, n);
      }, 0);
      const newProducts: Product[] = rows.map((row, i) => ({
        ...row,
        id: String(maxId + i + 1),
        inStock: row.inStock ?? true,
      }));
      const next = [...prev, ...newProducts];
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setProductsState(initialProducts);
  }, []);

  const value: ProductsContextValue = {
    products,
    addProducts,
    setProducts,
    resetToDefault,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) return { products: initialProducts, addProducts: () => {}, setProducts: () => {}, resetToDefault: () => {} };
  return ctx;
}
