import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/config/env";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  let reviews: { id: string; product_id: string; order_id: string; rating: number; comment: string; status: string; created_at: string }[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("product_reviews")
      .select("id, product_id, order_id, rating, comment, status, created_at")
      .order("created_at", { ascending: false });
    reviews = (data || []) as typeof reviews;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Review Moderation</h1>
      <p className="text-slate-600">Approve or reject product reviews. Connect Supabase to see pending reviews.</p>
      <AdminReviewsClient reviews={reviews} />
    </div>
  );
}
