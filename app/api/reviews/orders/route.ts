import { NextRequest, NextResponse } from "next/server";
import { getUserOrders, getUserOrderById } from "@/src/data/provider";
import { createClient } from "@/lib/supabase/server";
import { DATA_SOURCE } from "@/src/config/runtime";

async function getUserId(request: NextRequest): Promise<string | null> {
  const AUTH_MODE = (process.env.NEXT_PUBLIC_AUTH_MODE as "demo" | "supabase") ?? "demo";
  if (AUTH_MODE === "demo") {
    const session = request.cookies.get("demo_session")?.value;
    return session === "user" || session === "admin" ? "demo-user" : null;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Returns delivered orders with items for the logged-in user (for review order dropdown). */
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (DATA_SOURCE === "local") {
    const orders = await getUserOrders();
    const delivered = orders.filter((o) => o.status === "delivered");
    const withItems = await Promise.all(
      delivered.map(async (o) => {
        const full = await getUserOrderById(o.id);
        return {
          id: o.id,
          total: o.total,
          createdAt: o.createdAt,
          items: full?.items ?? [],
        };
      })
    );
    return NextResponse.json({ orders: withItems });
  }

  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("review_eligible_days").eq("id", "default").single();
  const days = (settings as { review_eligible_days?: number } | null)?.review_eligible_days ?? 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, total, created_at, status")
    .eq("user_id", userId === "demo-user" ? "" : userId)
    .eq("status", "delivered")
    .gte("created_at", since.toISOString());

  if (!ordersData?.length) return NextResponse.json({ orders: [] });

  const orders = await Promise.all(
    (ordersData as { id: string; total: number; created_at: string }[]).map(async (o) => {
      const { data: items } = await supabase.from("order_items").select("product_id, product_name, quantity, unit_price").eq("order_id", o.id);
      return {
        id: o.id,
        total: o.total,
        createdAt: o.created_at,
        items: (items || []).map((i) => ({
          productId: (i as { product_id: string }).product_id,
          name: (i as { product_name: string }).product_name,
          qty: (i as { quantity: number }).quantity,
          price: (i as { unit_price: number }).unit_price,
        })),
      };
    })
  );
  return NextResponse.json({ orders });
}
