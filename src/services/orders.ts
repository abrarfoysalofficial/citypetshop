/**
 * Orders repository – Prisma/PostgreSQL via provider and checkout API.
 */
import type { OrdersRepository, CreateOrderInput } from "./types";
import {
  getAdminOrders,
  getAdminOrderById,
  getUserOrders,
  getUserOrderById,
} from "@/src/data/provider";

/** Orders: read via provider; createOrder calls checkout API. */
export function createLocalOrdersRepository(): OrdersRepository {
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
    async getOrderById(id, userId) {
      const fromAdmin = await getAdminOrderById(id);
      if (fromAdmin) return fromAdmin;
      return getUserOrderById(id, userId ?? null);
    },
    async listOrdersByUser() {
      return getUserOrders();
    },
    async adminListOrders() {
      return getAdminOrders();
    },
  };
}
