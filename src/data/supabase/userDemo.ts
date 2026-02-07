import type { DemoUserProfile, DemoOrder, DemoInvoice, DemoReturn } from "../types";
import { createClient } from "@/lib/supabase/server";

type OrderRow = {
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
};

function rowToDemoOrder(row: OrderRow): DemoOrder {
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

export async function getUserAccountOverview(): Promise<{
  profile: DemoUserProfile;
  recentOrders: DemoOrder[];
  orderCount: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile: DemoUserProfile = {
    id: user?.id ?? "",
    email: user?.email ?? "",
    name: (user?.user_metadata?.name as string) ?? undefined,
  };
  const { data: rows } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_name, status, total, created_at, shipping_address, payment_method"
    )
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(10);
  const rowList = (rows ?? []) as OrderRow[];
  const orders = rowList.map((r: OrderRow) => rowToDemoOrder(r));
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "");
  return {
    profile,
    recentOrders: orders,
    orderCount: count ?? 0,
  };
}

export async function getUserOrders(): Promise<DemoOrder[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return [];
  const { data: rows } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_name, status, total, created_at, shipping_address, payment_method"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const rowList = (rows ?? []) as OrderRow[];
  return rowList.map((r: OrderRow) => rowToDemoOrder(r));
}

export async function getUserOrderById(id: string): Promise<DemoOrder | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, guest_email, guest_name, status, total, created_at, shipping_address, payment_method"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (error || !order) return null;
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity, unit_price")
    .eq("order_id", id);
  return rowToDemoOrder({
    ...order,
    order_items: (items as { product_id: string; product_name: string; quantity: number; unit_price: number }[]) ?? [],
  });
}

export async function getUserInvoices(): Promise<DemoInvoice[]> {
  return [];
}

export async function getUserReturns(): Promise<DemoReturn[]> {
  return [];
}
