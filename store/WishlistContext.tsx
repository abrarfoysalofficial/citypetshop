"use client";

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";

const WISHLIST_KEY = "cityplus_wishlist";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  categorySlug: string;
  addedAt: number;
}

interface WishlistContextValue {
  items: WishlistItem[];
  add: (item: Omit<WishlistItem, "addedAt">) => void;
  remove: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggle: (item: Omit<WishlistItem, "addedAt">) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function loadFromStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(loadFromStorage());
  }, []);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const add = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const toggle = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      if (isInWishlist(item.id)) remove(item.id);
      else add(item);
    },
    [add, remove, isInWishlist]
  );

  const value: WishlistContextValue = {
    items,
    add,
    remove,
    isInWishlist,
    toggle,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
