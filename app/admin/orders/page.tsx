"use client";

import { useState, useEffect } from "react";
import AdminOrdersClient from "./AdminOrdersClient";

type Order = {
  id: string;
  customerName?: string;
  email?: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch((err) => setError(err.message ?? "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-slate-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
        <p className="font-medium text-red-800">Error</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return <AdminOrdersClient orders={orders} />;
}
