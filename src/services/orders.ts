/**
 * Orders repository implementations.
 * Supabase: real DB when configured; Local: demo data from provider.
 */
import type { DemoOrder } from "@/src/data/types";
import type { OrdersRepository, CreateOrderInput } from "./types";
import {
  getAdminOrders,
  getAdminOrderById,
  getUserOrders,
  getUserOrderById,
} from "@/src/data/provider";

/** Demo/local orders: read-only from provider; createOrder returns a stub id. */
export function createLocalOrdersRepository(): OrdersRepository {
  return {
    async createOrder() {
      return { orderId: `demo-${Date.now()}` };
    },
    async getOrderById(id) {
      const fromAdmin = await getAdminOrderById(id);
      if (fromAdmin) return fromAdmin;
      return getUserOrderById(id);
    },
    async listOrdersByUser() {
      return getUserOrders();
    },
    async adminListOrders() {
      return getAdminOrders();
    },
  };
}

/** Supabase orders: same read path via provider when DATA_SOURCE allows; createOrder can call API later. */
export function createSupabaseOrdersRepository(): OrdersRepository {
  return {
    async createOrder(input: CreateOrderInput) {
      try {
        const res = await fetch("/api/checkout/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: (data as { error?: string }).error ?? "Failed to create order" };
        return { orderId: (data as { orderId?: string }).orderId ?? `ord-${Date.now()}` };
      } catch {
        return { error: "Network error" };
      }
    },
    async getOrderById(id) {
      const fromAdmin = await getAdminOrderById(id);
      if (fromAdmin) return fromAdmin;
      return getUserOrderById(id);
    },
    async listOrdersByUser() {
      return getUserOrders();
    },
    async adminListOrders() {
      return getAdminOrders();
    },
  };
}
