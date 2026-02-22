import { NextRequest, NextResponse } from "next/server";
import { getUserOrderById } from "@/src/data/provider";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  orderId: z.string().min(1, "Order is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user as { id?: string })?.id ?? null;
}

/** POST: Submit a review. Server-side validation. */
export async function POST(request: NextRequest) {
  const userId = await getUserId();
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

  // Check if review already exists
  const existing = await prisma.productReview.findFirst({
    where: { productId, orderId }
  });
  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product for this order." }, { status: 409 });
  }

  await prisma.productReview.create({
    data: {
      productId,
      orderId,
      userId,
      rating,
      comment,
      status: "pending",
    }
  });

  return NextResponse.json({ success: true });
}

/** GET: Fetch reviews for a product (approved only). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const reviews = await prisma.productReview.findMany({
    where: {
      productId,
      status: "approved"
    },
    select: {
      id: true,
      orderId: true,
      rating: true,
      comment: true,
      createdAt: true,
    }
  });

  const formatted = reviews.map(r => ({
    id: r.id,
    orderId: r.orderId,
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt.toISOString().slice(0, 10),
    verified: true,
  }));

  return NextResponse.json({ reviews: formatted });
}
