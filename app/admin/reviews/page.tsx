export const dynamic = "force-dynamic";
import { prisma } from "@lib/db";
import AdminReviewsClient from "./AdminReviewsClient";
import { PageHero } from "@/components/admin/page-hero";

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
      <PageHero
        title="Review Moderation"
        description="Approve or reject product reviews."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Reviews" }]}
      />
      <AdminReviewsClient reviews={formattedReviews} />
    </div>
  );
}
