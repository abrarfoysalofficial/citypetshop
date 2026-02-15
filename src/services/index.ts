/**
 * Central service access: products, orders, auth.
 * Uses resolved config (env.ts + runtime.ts); fallbacks applied there.
 * Build never depends on env; missing Sanity/Supabase yields local/demo.
 */
import type { ProductsRepository, OrdersRepository, AuthService } from "./types";
import { createProviderProductsRepository } from "./products";
import { createLocalOrdersRepository, createSupabaseOrdersRepository } from "./orders";
import { createSupabaseAuthService, createDemoAuthService } from "./auth";
import { getResolvedProductsSource, getResolvedAuthSource, isSupabaseConfigured } from "@/src/config/env";

let _products: ProductsRepository | null = null;
let _orders: OrdersRepository | null = null;
let _auth: AuthService | null = null;

function getProductsRepository(): ProductsRepository {
  if (!_products) {
    _products = createProviderProductsRepository();
  }
  return _products;
}

function getOrdersRepository(): OrdersRepository {
  if (!_orders) {
    const auth = getResolvedAuthSource();
    const useSupabase = auth === "supabase" && isSupabaseConfigured();
    _orders = useSupabase ? createSupabaseOrdersRepository() : createLocalOrdersRepository();
  }
  return _orders;
}

function getAuthService(): AuthService {
  if (!_auth) {
    const auth = getResolvedAuthSource();
    _auth = auth === "supabase" ? createSupabaseAuthService() : createDemoAuthService();
  }
  return _auth;
}

export interface Services {
  products: ProductsRepository;
  orders: OrdersRepository;
  auth: AuthService;
}

/** Resolved sources for status panel / debugging. */
export function getResolvedSources(): {
  products: "sanity" | "local" | "supabase";
  auth: "supabase" | "demo";
  orders: "supabase" | "local";
} {
  const auth = getResolvedAuthSource();
  return {
    products: getResolvedProductsSource(),
    auth,
    orders: auth === "supabase" && isSupabaseConfigured() ? "supabase" : "local",
  };
}

export function getServices(): Services {
  return {
    products: getProductsRepository(),
    orders: getOrdersRepository(),
    auth: getAuthService(),
  };
}

export type { ProductsRepository, OrdersRepository, AuthService, CreateOrderInput } from "./types";
export { createProviderProductsRepository } from "./products";
export { createLocalOrdersRepository, createSupabaseOrdersRepository } from "./orders";
export { createSupabaseAuthService, createDemoAuthService } from "./auth";
