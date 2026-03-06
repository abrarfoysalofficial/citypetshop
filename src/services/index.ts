/**
 * Central service access: products, orders, auth.
 * All backed by Prisma/PostgreSQL – single source of truth.
 */
import type { ProductsRepository, OrdersRepository, AuthService } from "./types";
import { createProviderProductsRepository } from "./products";
import { createLocalOrdersRepository } from "./orders";
import { createNextAuthAuthService } from "./auth";

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
    _orders = createLocalOrdersRepository();
  }
  return _orders;
}

function getAuthService(): AuthService {
  if (!_auth) {
    _auth = createNextAuthAuthService();
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
  products: string;
  auth: string;
  orders: string;
} {
  return {
    products: "prisma",
    auth: "nextauth",
    orders: "prisma",
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
export { createLocalOrdersRepository } from "./orders";
export { createNextAuthAuthService } from "./auth";
