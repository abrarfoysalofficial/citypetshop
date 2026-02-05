import type {
  DemoOrder,
  DemoCustomer,
  DemoDashboard,
  DemoVoucher,
  DemoAuditLog,
} from "../types";

const now = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

export const demoOrders: DemoOrder[] = [
  { id: "ORD-1001", customerName: "Rahim Khan", email: "rahim@example.com", total: 4590, status: "delivered", createdAt: fmt(daysAgo(2)), paymentMethod: "COD" },
  { id: "ORD-1002", customerName: "Fatima Ahmed", email: "fatima@example.com", total: 2890, status: "shipped", createdAt: fmt(daysAgo(1)), paymentMethod: "COD" },
  { id: "ORD-1003", customerName: "Karim Hossain", email: "karim@example.com", total: 1250, status: "processing", createdAt: fmt(daysAgo(1)), paymentMethod: "COD" },
  { id: "ORD-1004", customerName: "Sara Islam", email: "sara@example.com", total: 3200, status: "pending", createdAt: fmt(daysAgo(0)), paymentMethod: "COD" },
  { id: "ORD-1005", customerName: "Tariq Mahmud", email: "tariq@example.com", total: 1890, status: "delivered", createdAt: fmt(daysAgo(3)), paymentMethod: "COD" },
  { id: "ORD-1006", customerName: "Nadia Rahman", email: "nadia@example.com", total: 5500, status: "cancelled", createdAt: fmt(daysAgo(4)), paymentMethod: "COD" },
  { id: "ORD-1007", customerName: "Omar Faruq", email: "omar@example.com", total: 2100, status: "returned", createdAt: fmt(daysAgo(5)), paymentMethod: "COD" },
  { id: "ORD-1008", customerName: "Laila Begum", email: "laila@example.com", total: 3400, status: "delivered", createdAt: fmt(daysAgo(6)), paymentMethod: "COD" },
  { id: "ORD-1009", customerName: "Hasan Ali", email: "hasan@example.com", total: 890, status: "shipped", createdAt: fmt(daysAgo(2)), paymentMethod: "COD" },
  { id: "ORD-1010", customerName: "Zara Khan", email: "zara@example.com", total: 4200, status: "processing", createdAt: fmt(daysAgo(0)), paymentMethod: "COD" },
  { id: "ORD-1011", customerName: "Imran Chowdhury", email: "imran@example.com", total: 1750, status: "pending", createdAt: fmt(daysAgo(0)), paymentMethod: "COD" },
  { id: "ORD-1012", customerName: "Ayesha Siddique", email: "ayesha@example.com", total: 6100, status: "delivered", createdAt: fmt(daysAgo(7)), paymentMethod: "COD" },
];

export const demoCustomers: DemoCustomer[] = [
  { id: "C1", name: "Rahim Khan", email: "rahim@example.com", phone: "+880 1712 345678", ordersCount: 5, lastOrderAt: fmt(daysAgo(2)) },
  { id: "C2", name: "Fatima Ahmed", email: "fatima@example.com", phone: "+880 1812 345679", ordersCount: 3, lastOrderAt: fmt(daysAgo(1)) },
  { id: "C3", name: "Karim Hossain", email: "karim@example.com", phone: "+880 1912 345680", ordersCount: 8, lastOrderAt: fmt(daysAgo(1)) },
  { id: "C4", name: "Sara Islam", email: "sara@example.com", phone: "+880 1612 345681", ordersCount: 2, lastOrderAt: fmt(daysAgo(0)) },
  { id: "C5", name: "Tariq Mahmud", email: "tariq@example.com", phone: "+880 1713 345682", ordersCount: 4, lastOrderAt: fmt(daysAgo(3)) },
  { id: "C6", name: "Nadia Rahman", email: "nadia@example.com", phone: "+880 1813 345683", ordersCount: 1, lastOrderAt: fmt(daysAgo(4)) },
  { id: "C7", name: "Omar Faruq", email: "omar@example.com", phone: "+880 1913 345684", ordersCount: 6, lastOrderAt: fmt(daysAgo(5)) },
  { id: "C8", name: "Laila Begum", email: "laila@example.com", phone: "+880 1613 345685", ordersCount: 9, lastOrderAt: fmt(daysAgo(6)) },
  { id: "C9", name: "Hasan Ali", email: "hasan@example.com", phone: "+880 1714 345686", ordersCount: 12, lastOrderAt: fmt(daysAgo(2)) },
  { id: "C10", name: "Zara Khan", email: "zara@example.com", phone: "+880 1814 345687", ordersCount: 2, lastOrderAt: fmt(daysAgo(0)) },
];

export const demoVouchers: DemoVoucher[] = [
  { id: "V1", code: "WELCOME10", type: "percent", value: 10, minPurchase: 500, startDate: "2025-01-01", endDate: "2025-12-31", active: true, usageCount: 42 },
  { id: "V2", code: "FLAT50", type: "fixed", value: 50, startDate: "2025-01-15", endDate: "2025-02-15", active: true, usageCount: 18 },
  { id: "V3", code: "PET20", type: "percent", value: 20, minPurchase: 2000, startDate: "2025-01-01", endDate: "2025-06-30", active: true, usageCount: 7 },
  { id: "V4", code: "OLD100", type: "fixed", value: 100, minPurchase: 1000, startDate: "2024-12-01", endDate: "2025-01-31", active: false, usageCount: 55 },
  { id: "V5", code: "NEWYEAR25", type: "percent", value: 25, minPurchase: 3000, startDate: "2025-01-01", endDate: "2025-01-07", active: false, usageCount: 23 },
];

export const demoAuditLogs: DemoAuditLog[] = [
  { id: "A1", action: "order.created", entity: "ORD-1012", details: "Order placed", createdAt: fmt(daysAgo(7)) },
  { id: "A2", action: "product.updated", entity: "product-5", details: "Price changed", createdAt: fmt(daysAgo(6)) },
  { id: "A3", action: "voucher.created", entity: "NEWYEAR25", details: "New voucher", createdAt: fmt(daysAgo(5)) },
  { id: "A4", action: "order.shipped", entity: "ORD-1008", details: "Tracking updated", createdAt: fmt(daysAgo(4)) },
  { id: "A5", action: "admin.login", entity: "admin", details: "Admin login", createdAt: fmt(daysAgo(3)) },
  { id: "A6", action: "order.returned", entity: "ORD-1007", details: "Return approved", createdAt: fmt(daysAgo(2)) },
  { id: "A7", action: "blog.published", entity: "post-slug", details: "New post", createdAt: fmt(daysAgo(1)) },
  { id: "A8", action: "order.created", entity: "ORD-1004", details: "Order placed", createdAt: fmt(daysAgo(0)) },
];

const totalSales = demoOrders.filter((o) => ["delivered", "shipped", "processing", "pending"].includes(o.status)).reduce((s, o) => s + o.total, 0);
const returned = demoOrders.filter((o) => o.status === "returned").length;
const orderCount = demoOrders.length;
const returnRate = orderCount ? ((returned / orderCount) * 100).toFixed(1) : "0";

export function getAdminDashboard(): DemoDashboard {
  return {
    summary: {
      sales: `৳${totalSales.toLocaleString("en-BD")}`,
      profit: `৳${Math.round(totalSales * 0.15).toLocaleString("en-BD")}`,
      orders: String(orderCount),
      returnRate: `${returnRate}%`,
      loss: "৳0",
    },
    salesData: [
      { name: "Mon", sales: 12500, visits: 320 },
      { name: "Tue", sales: 18900, visits: 410 },
      { name: "Wed", sales: 14200, visits: 380 },
      { name: "Thu", sales: 22100, visits: 490 },
      { name: "Fri", sales: 25600, visits: 520 },
      { name: "Sat", sales: 31200, visits: 610 },
      { name: "Sun", sales: 28400, visits: 550 },
    ],
    activity: demoOrders.slice(0, 6).map((o, i) => ({
      id: i + 1,
      text: `Order #${o.id} — ৳${o.total.toLocaleString("en-BD")} (${o.status})`,
      time: new Date(o.createdAt).toLocaleString(),
    })),
  };
}

export function getAdminOrders(): DemoOrder[] {
  return [...demoOrders];
}

export function getAdminOrderById(id: string): DemoOrder | null {
  const order = demoOrders.find((o) => o.id === id || o.id === id.replace(/^ORD-/, "ORD-"));
  if (!order) return null;
  return {
    ...order,
    items: [
      { productId: "1", name: "Premium Adult Dog Food 10kg", qty: 1, price: 2890 },
      { productId: "2", name: "Drools Puppy Dry Food 1kg", qty: 2, price: 550 },
    ],
    shippingAddress: "House 12, Road 5, Dhanmondi, Dhaka 1209",
  };
}

export function getAdminCustomers(): DemoCustomer[] {
  return [...demoCustomers];
}

export function getAdminVouchers(): DemoVoucher[] {
  return [...demoVouchers];
}

export function getAdminAuditLogs(): DemoAuditLog[] {
  return [...demoAuditLogs];
}
