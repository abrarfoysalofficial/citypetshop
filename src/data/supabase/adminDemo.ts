import type { DemoDashboard, DemoOrder, DemoCustomer, DemoVoucher, DemoAuditLog } from "../types";
import { createClient } from "@/lib/supabase/server";

function rowToDemoOrder(row: {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  status: string;
  total: number;
  created_at: string;
  shipping_address?: string | null;
  payment_method?: string | null;
  order_items?: { product_id: string; product_name: string; quantity: number; unit_price: number }[];
}): DemoOrder {
  return {
    id: row.id,
    customerId: row.user_id ?? undefined,
    customerName: row.guest_name ?? undefined,
    email: row.guest_email ?? undefined,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    items: row.order_items?.map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      qty: i.quantity,
      price: Number(i.unit_price),
    })),
    shippingAddress: row.shipping_address ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
  };
}

export async function getAdminDashboard(): Promise<DemoDashboard> {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("id, total").limit(500);
  const totalOrders = orders?.length ?? 0;
  const sales = orders?.reduce((s: number, o: any) => s + Number(o?.total ?? 0), 0) ?? 0;
  return {
    summary: {
      sales: `৳${Math.round(sales)}`,
      profit: "৳0",
      orders: String(totalOrders),
      returnRate: "0%",
      loss: "৳0",
    },
    salesData: [],
    activity: [],
  };
}

export async function getAdminOrders(): Promise<DemoOrder[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_name, status, total, created_at, shipping_address, payment_method"
    )
    .order("created_at", { ascending: false });

  if (error || !rows) return [];
  const orders = rows as {
    id: string;
    user_id: string | null;
    guest_email: string | null;
    guest_name: string | null;
    status: string;
    total: number;
    created_at: string;
    shipping_address?: string | null;
    payment_method?: string | null;
  }[];
  return orders.map(rowToDemoOrder);
}

export async function getAdminOrderById(id: string): Promise<DemoOrder | null> {
  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_name, status, total, created_at, shipping_address, payment_method"
    )
    .eq("id", id)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity, unit_price")
    .eq("order_id", id);

  return rowToDemoOrder({
    ...order,
    order_items: (items as { product_id: string; product_name: string; quantity: number; unit_price: number }[]) ?? [],
  });
}

export async function getAdminCustomers(): Promise<DemoCustomer[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("orders")
    .select("user_id, guest_email, guest_name, guest_phone, created_at");
  if (!rows?.length) return [];
  const byEmail = new Map<
    string,
    { id: string; name: string; email: string; phone?: string; ordersCount: number; lastOrderAt?: string }
  >();
  for (const r of rows as { user_id: string | null; guest_email: string | null; guest_name: string | null; guest_phone: string | null; created_at: string }[]) {
    const email = r.guest_email ?? r.user_id ?? "unknown";
    const key = email;
    const existing = byEmail.get(key);
    const lastOrderAt = r.created_at;
    if (!existing) {
      byEmail.set(key, {
        id: r.user_id ?? key,
        name: r.guest_name ?? "Guest",
        email,
        phone: r.guest_phone ?? undefined,
        ordersCount: 1,
        lastOrderAt,
      });
    } else {
      existing.ordersCount += 1;
      if (lastOrderAt > (existing.lastOrderAt ?? "")) existing.lastOrderAt = lastOrderAt;
    }
  }
  return Array.from(byEmail.values());
}

export async function getAdminVouchers(): Promise<DemoVoucher[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("vouchers")
    .select("id, code, discount_type, discount_value, min_order_amount, valid_from, expiry_at, usage_count, is_active")
    .limit(100);
  if (!rows?.length) return [];
  return (rows as {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount?: number | null;
    valid_from?: string | null;
    expiry_at?: string | null;
    usage_count?: number | null;
    is_active: boolean;
  }[]).map((r) => ({
    id: r.id,
    code: r.code,
    type: (r.discount_type === "percent" ? "percent" : "fixed") as "percent" | "fixed",
    value: Number(r.discount_value),
    minPurchase: r.min_order_amount ?? undefined,
    startDate: r.valid_from ?? new Date().toISOString(),
    endDate: r.expiry_at ?? new Date().toISOString(),
    active: r.is_active,
    usageCount: r.usage_count ?? 0,
  }));
}

export async function getAdminAuditLogs(): Promise<DemoAuditLog[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("activity_log")
    .select("id, action, actor_id, actor_name, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!rows?.length) return [];
  return (rows as {
    id: string;
    action: string;
    actor_id: string | null;
    actor_name: string | null;
    entity_type: string | null;
    entity_id: string | null;
    details: unknown;
    created_at: string;
  }[]).map((r) => ({
    id: r.id,
    action: r.action,
    userId: r.actor_id ?? undefined,
    entity: r.entity_type ?? undefined,
    details: typeof r.details === "object" ? JSON.stringify(r.details) : undefined,
    createdAt: r.created_at,
  }));
}
