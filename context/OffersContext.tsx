"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Offer } from "@/lib/types";

interface OffersContextValue {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, "id">) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  getOffer: (id: string) => Offer | undefined;
  lastUpdated: string | null;
}

const OffersContext = createContext<OffersContextValue | null>(null);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const persist = useCallback((next: Offer[]) => {
    setOffers(next);
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
