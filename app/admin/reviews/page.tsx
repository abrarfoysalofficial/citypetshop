export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    select: {
      id: true,
      productId: true,
      orderId: true,
      rating: true,
      comment: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedReviews = reviews.map(review => ({
    id: review.id,
    product_id: review.productId || "",
    order_id: review.orderId,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    created_at: review.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Review Moderation</h1>
      <p className="text-slate-600">Approve or reject product reviews.</p>
      <AdminReviewsClient reviews={formattedReviews} />
    </div>
  );
}
