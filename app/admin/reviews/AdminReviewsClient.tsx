"use client";

import { useState } from "react";

type Review = { id: string; product_id: string; order_id: string; rating: number; comment: string; status: string; created_at: string };

export default function AdminReviewsClient({ reviews }: { reviews: Review[] }) {
  const [list, setList] = useState(reviews);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  if (list.length === 0) {
    return <p className="text-slate-500">No reviews to moderate.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="p-3 font-medium text-slate-900">Product</th>
            <th className="p-3 font-medium text-slate-900">Order</th>
            <th className="p-3 font-medium text-slate-900">Rating</th>
            <th className="p-3 font-medium text-slate-900">Comment</th>
            <th className="p-3 font-medium text-slate-900">Status</th>
            <th className="p-3 font-medium text-slate-900">Date</th>
            <th className="p-3 font-medium text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="p-3 font-mono text-slate-700">{r.product_id.slice(0, 8)}…</td>
              <td className="p-3 font-mono text-slate-700">{r.order_id.slice(0, 8)}…</td>
              <td className="p-3">{r.rating}★</td>
              <td className="p-3 max-w-xs truncate text-slate-600">{r.comment}</td>
              <td className="p-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "approved" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {r.status}
                </span>
              </td>
              <td className="p-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                {r.status === "pending" && (
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(r.id, "approved")} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">Approve</button>
                    <button onClick={() => updateStatus(r.id, "rejected")} className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700">Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
