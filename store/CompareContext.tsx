"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import type { Product } from "@/lib/types";

const MAX_COMPARE = 4;

interface CompareState {
  items: Product[];
}

type CompareAction =
  | { type: "ADD"; payload: Product }
  | { type: "REMOVE"; payload: string }
  | { type: "CLEAR" };

const initialState: CompareState = { items: [] };

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "ADD": {
      if (state.items.some((i) => i.id === action.payload.id)) return state;
      if (state.items.length >= MAX_COMPARE) return state;
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.payload) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CompareContextValue extends CompareState {
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, initialState);
  const addToCompare = useCallback((product: Product) => {
    dispatch({ type: "ADD", payload: product });
  }, []);
  const removeFromCompare = useCallback((id: string) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);
  const clearCompare = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const isInCompare = useCallback(
    (id: string) => state.items.some((i) => i.id === id),
    [state.items]
  );
  const value: CompareContextValue = {
    ...state,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
  };
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
