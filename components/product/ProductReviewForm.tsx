"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import VerifiedBuyerBadge from "@/components/trust/VerifiedBuyerBadge";

interface OrderOption {
  id: string;
  total: number;
  createdAt: string;
  items: { productId: string; name: string; qty: number; price: number }[];
}

interface Review {
  id: string;
  orderId: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ProductReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export default function ProductReviewForm({ productId, onSubmitted }: ProductReviewFormProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const eligibleOrders = orders.filter((o) => o.items.some((i) => i.productId === productId));

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(d.isLoggedIn === true));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/reviews/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));
  }, [productId, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !comment.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderId, rating, comment: comment.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Failed to submit review.");
        return;
      }
      setSuccess(true);
      setComment("");
      setOrderId("");
      setRating(5);
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoggedIn === null) {
    return <p className="mt-4 text-sm text-slate-500">Loading…</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">You must be logged in to submit a review.</p>
        <Link href="/login" className="mt-2 inline-block font-medium text-primary hover:underline">
          Log in →
        </Link>
      </div>
    );
  }

  if (eligibleOrders.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          You need a delivered order containing this product to leave a review. Shop and complete an order first.
        </p>
        <Link href="/shop" className="mt-2 inline-block font-medium text-primary hover:underline">
          Shop now →
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4 max-w-lg space-y-3">
        <div>
          <label htmlFor="review-order" className="block text-sm font-medium text-gray-700">
            Select Order to Review <span className="text-red-500">*</span>
          </label>
          <select
            id="review-order"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
          >
            <option value="">Choose an order…</option>
            {eligibleOrders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} — ৳{o.total.toLocaleString("en-BD")} — {new Date(o.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label={`${r} star`}
              >
                <Star className={`h-6 w-6 ${r <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-comment"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            placeholder="Share your experience (min 10 characters)"
            minLength={10}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Thank you! Your review has been submitted.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
      {reviews.length > 0 && (
        <ul className="mt-8 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-900">Verified Buyer</span>
                <span className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400" : "text-gray-300"}`} />
                  ))}
                </span>
                <span className="text-sm text-gray-500">{r.date}</span>
                <VerifiedBuyerBadge verified={r.verified} />
              </div>
              <p className="mt-2 text-gray-600">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
