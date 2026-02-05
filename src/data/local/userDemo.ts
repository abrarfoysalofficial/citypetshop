import type { DemoUserProfile, DemoOrder, DemoInvoice, DemoReturn } from "../types";

const now = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

export const demoUserProfile: DemoUserProfile = {
  id: "user-demo",
  email: "user@cityplus.local",
  name: "Demo User",
  phone: "+880 1700 000001",
  address: "House 12, Road 5, Dhanmondi, Dhaka 1209",
};

export const demoUserOrders: DemoOrder[] = [
  { id: "ORD-1001", total: 4590, status: "delivered", createdAt: fmt(daysAgo(2)), paymentMethod: "COD" },
  { id: "ORD-1002", total: 2890, status: "shipped", createdAt: fmt(daysAgo(1)), paymentMethod: "COD" },
  { id: "ORD-1004", total: 3200, status: "pending", createdAt: fmt(daysAgo(0)), paymentMethod: "COD" },
  { id: "ORD-1008", total: 3400, status: "delivered", createdAt: fmt(daysAgo(6)), paymentMethod: "COD" },
];

export const demoUserInvoices: DemoInvoice[] = [
  { id: "INV-1001", orderId: "ORD-1001", number: "INV-2025-1001", date: fmt(daysAgo(2)), total: 4590, downloadUrl: "#" },
  { id: "INV-1002", orderId: "ORD-1002", number: "INV-2025-1002", date: fmt(daysAgo(1)), total: 2890, downloadUrl: "#" },
  { id: "INV-1008", orderId: "ORD-1008", number: "INV-2025-1008", date: fmt(daysAgo(6)), total: 3400, downloadUrl: "#" },
];

export const demoUserReturns: DemoReturn[] = [
  { id: "RET-1", orderId: "ORD-1002", status: "approved", reason: "Wrong size", requestedAt: fmt(daysAgo(1)), updatedAt: fmt(daysAgo(0)) },
  { id: "RET-2", orderId: "ORD-1008", status: "pending", reason: "Damaged item", requestedAt: fmt(daysAgo(0)) },
];

export function getUserAccountOverview(): { profile: DemoUserProfile; recentOrders: DemoOrder[]; orderCount: number } {
  return {
    profile: demoUserProfile,
    recentOrders: demoUserOrders.slice(0, 5),
    orderCount: demoUserOrders.length,
  };
}

export function getUserOrders(): DemoOrder[] {
  return [...demoUserOrders];
}

const ORDER_ITEMS: Record<string, { productId: string; name: string; qty: number; price: number }[]> = {
  "ORD-1001": [
    { productId: "1", name: "Premium Adult Dog Food 10kg", qty: 1, price: 2890 },
    { productId: "2", name: "Drools Puppy Dry Food 1kg", qty: 2, price: 550 },
  ],
  "ORD-1008": [
    { productId: "5", name: "Whiskas Ocean Fish 1.2kg", qty: 1, price: 480 },
    { productId: "6", name: "SmartHeart Adult Cat Food 1kg", qty: 2, price: 450 },
  ],
};

export function getUserOrderById(id: string): DemoOrder | null {
  const order = demoUserOrders.find((o) => o.id === id || o.id === id.replace(/^ORD-/, "ORD-"));
  if (!order) return null;
  const items = ORDER_ITEMS[order.id] ?? ORDER_ITEMS["ORD-1001"]!;
  return {
    ...order,
    items,
    shippingAddress: demoUserProfile.address,
  };
}

export function getUserInvoices(): DemoInvoice[] {
  return [...demoUserInvoices];
}

export function getUserReturns(): DemoReturn[] {
  return [...demoUserReturns];
}
