import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, shipping_name, shipping_email, total, status")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data) {
        orders = data.map((o: any) => ({
          id: o.id,
          customerName: o.shipping_name ?? undefined,
          email: o.shipping_email ?? undefined,
          total: Number(o.total ?? 0),
          status: o.status ?? "pending",
          createdAt: o.created_at,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }

  return <AdminOrdersClient orders={orders} />;
}
