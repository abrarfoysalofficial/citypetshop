"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Voucher } from "@/lib/types";

const STORAGE_KEY = "city-plus-pet-shop-vouchers";

interface VouchersContextValue {
  vouchers: Voucher[];
  addVoucher: (v: Omit<Voucher, "id" | "usedCount">) => void;
  updateVoucher: (id: string, v: Partial<Voucher>) => void;
  deleteVoucher: (id: string) => void;
  getVoucher: (id: string) => Voucher | undefined;
  getVoucherByCode: (code: string) => Voucher | undefined;
  lastUpdated: string | null;
}

const VouchersContext = createContext<VouchersContextValue | null>(null);

function loadStored(): Voucher[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Voucher[];
  } catch {
    return [];
  }
}

function save(vouchers: Voucher[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
    localStorage.setItem(STORAGE_KEY + "-updated", new Date().toISOString());
  } catch {
    //
  }
}

export function VouchersProvider({ children }: { children: ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setVouchers(loadStored());
    setLastUpdated(localStorage.getItem(STORAGE_KEY + "-updated"));
  }, []);

  const persist = useCallback((next: Voucher[]) => {
    setVouchers(next);
    save(next);
    setLastUpdated(new Date().toISOString());
  }, []);

  const addVoucher = useCallback(
    (v: Omit<Voucher, "id" | "usedCount">) => {
      const id = "voucher-" + Date.now();
      persist([...vouchers, { ...v, id, usedCount: 0 }]);
    },
    [vouchers, persist]
  );

  const updateVoucher = useCallback(
    (id: string, data: Partial<Voucher>) => {
      persist(
        vouchers.map((o) =>
          o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
        )
      );
    },
    [vouchers, persist]
  );

  const deleteVoucher = useCallback(
    (id: string) => persist(vouchers.filter((o) => o.id !== id)),
    [vouchers, persist]
  );

  const getVoucher = useCallback((id: string) => vouchers.find((o) => o.id === id), [vouchers]);
  const getVoucherByCode = useCallback(
    (code: string) => vouchers.find((o) => o.code.toLowerCase() === code.toLowerCase()),
    [vouchers]
  );

  const value: VouchersContextValue = {
    vouchers,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    getVoucher,
    getVoucherByCode,
    lastUpdated,
  };

  return (
    <VouchersContext.Provider value={value}>{children}</VouchersContext.Provider>
  );
}

export function useVouchers() {
  const ctx = useContext(VouchersContext);
  if (!ctx)
    return {
      vouchers: [],
      addVoucher: () => {},
      updateVoucher: () => {},
      deleteVoucher: () => {},
      getVoucher: () => undefined,
      getVoucherByCode: () => undefined,
      lastUpdated: null,
    };
  return ctx;
}
