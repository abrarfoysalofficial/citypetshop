import { NextRequest, NextResponse } from "next/server";
import { getUserOrderById } from "@/src/data/provider";
import { createClient } from "@/lib/supabase/server";
import { DATA_SOURCE } from "@/src/config/runtime";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  orderId: z.string().min(1, "Order is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

const reviewStore = new Map<string, { productId: string; orderId: string; rating: number; comment: string; date: string; userId: string }>();
const key = (orderId: string, productId: string) => `${orderId}::${productId}`;

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

/** POST: Submit a review. Server-side validation. */
export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "You must be logged in to submit a review." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  const { productId, orderId, rating, comment } = parsed.data;

  const order = await getUserOrderById(orderId);
  if (!order || order.status !== "delivered") {
    return NextResponse.json({ error: "Order not found or not delivered." }, { status: 400 });
  }

  const hasProduct = order.items?.some((i) => i.productId === productId);
  if (!hasProduct) {
    return NextResponse.json({ error: "This product was not in the selected order." }, { status: 400 });
  }

  if (DATA_SOURCE === "local") {
    const storeKey = key(orderId, productId);
    if (reviewStore.has(storeKey)) {
      return NextResponse.json({ error: "You have already reviewed this product for this order." }, { status: 409 });
    }
    reviewStore.set(storeKey, {
      productId,
      orderId,
      rating,
      comment,
      date: new Date().toISOString().slice(0, 10),
      userId,
    });
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    order_id: orderId,
    user_id: userId === "demo-user" ? null : userId,
    rating,
    comment,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "You have already reviewed this product for this order." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

/** GET: Fetch reviews for a product (approved only for Supabase). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  if (DATA_SOURCE === "local") {
    const reviews = Array.from(reviewStore.values())
      .filter((r) => r.productId === productId)
      .map((r) => ({
        id: `${r.orderId}-${r.productId}`,
        orderId: r.orderId,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        verified: true,
      }));
    return NextResponse.json({ reviews });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("id, order_id, rating, comment, created_at")
    .eq("product_id", productId)
    .eq("status", "approved");

  type ReviewRow = { id: string; order_id: string; rating: number; comment: string | null; created_at?: string };
  const reviews = (data || []).map((r: ReviewRow) => ({
    id: r.id,
    orderId: r.order_id,
    rating: r.rating,
    comment: r.comment,
    date: r.created_at?.slice(0, 10) ?? "",
    verified: true,
  }));
  return NextResponse.json({ reviews });
}
