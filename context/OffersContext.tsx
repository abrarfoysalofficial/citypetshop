"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Offer } from "@/lib/types";

const STORAGE_KEY = "city-plus-pet-shop-offers";

interface OffersContextValue {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, "id">) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  getOffer: (id: string) => Offer | undefined;
  lastUpdated: string | null;
}

const OffersContext = createContext<OffersContextValue | null>(null);

function loadStored(): Offer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Offer[];
  } catch {
    return [];
  }
}

function save(offers: Offer[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setOffers(loadStored());
    setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
  }, []);

  const persist = useCallback((next: Offer[]) => {
    setOffers(next);
    save(next);
    setLastUpdated(new Date().toISOString());
  }, []);

  const addOffer = useCallback(
    (offer: Omit<Offer, "id">) => {
      const id = "offer-" + Date.now();
      persist([...offers, { ...offer, id }]);
    },
    [offers, persist]
  );

  const updateOffer = useCallback(
    (id: string, data: Partial<Offer>) => {
      persist(
        offers.map((o) => (o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o))
      );
    },
    [offers, persist]
  );

  const deleteOffer = useCallback(
    (id: string) => {
      persist(offers.filter((o) => o.id !== id));
    },
    [offers, persist]
  );

  const getOffer = useCallback(
    (id: string) => offers.find((o) => o.id === id),
    [offers]
  );

  const value: OffersContextValue = {
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    getOffer,
    lastUpdated,
  };

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export function useOffers() {
  const ctx = useContext(OffersContext);
  if (!ctx)
    return {
      offers: [],
      addOffer: () => {},
      updateOffer: () => {},
      deleteOffer: () => {},
      getOffer: () => undefined,
      lastUpdated: null,
    };
  return ctx;
}
