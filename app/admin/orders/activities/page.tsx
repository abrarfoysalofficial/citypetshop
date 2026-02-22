"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  type: "note" | "status";
  createdAt: string;
  orderId: string;
  data: { type?: string; message?: string; createdBy?: string; status?: string; provider?: string };
};

export default function OrderActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders/activities?limit=100")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.activities) setActivities(d.activities);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Order Activities</h1>
        <Link href="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to Orders
        </Link>
      </div>
      <p className="text-slate-600">
        Recent notes and status changes across all orders.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No activities yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activities.map((a) => (
              <li key={a.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.type === "note" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {a.type === "note" ? "Note" : "Status"}
                      </span>
                      {a.type === "note" ? (
                        <span className="text-sm text-slate-700">{a.data.message}</span>
                      ) : (
                        <span className="text-sm text-slate-700">→ {a.data.status}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {a.data.createdBy && `by ${a.data.createdBy}`}
                      {a.data.provider && ` • ${a.data.provider}`}
                      {" • "}
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${a.orderId}`}
                    className="shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    View #{a.orderId.slice(0, 8)}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
