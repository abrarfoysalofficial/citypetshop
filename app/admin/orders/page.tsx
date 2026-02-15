import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getResolvedAuthSource } from "@/src/config/env";
import { DEMO_ORDERS } from "@/lib/demo-data";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: Array<{
    id: string;
    customerName?: string;
    email?: string;
    total: number;
    status: string;
    createdAt: string;
  }> = [];

  const useDemo = getResolvedAuthSource() === "demo" || !isSupabaseConfigured();

  if (useDemo) {
    orders = DEMO_ORDERS.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      email: o.email,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    }));
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, shipping_name, shipping_email, total, status")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data) {
        orders = data.map((o: { id: string; shipping_name?: string; shipping_email?: string; total?: number; status?: string; created_at: string }) => ({
          id: o.id,
          customerName: o.shipping_name ?? undefined,
          email: o.shipping_email ?? undefined,
          total: Number(o.total ?? 0),
          status: o.status ?? "pending",
          createdAt: o.created_at,
        }));
      }
    } catch (err) {
      console.error("[admin/orders] fetch error:", err);
    }
  }

  return <AdminOrdersClient orders={orders} />;
}
