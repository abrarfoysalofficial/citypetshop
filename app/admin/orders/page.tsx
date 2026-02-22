"use client";

import { useState, useEffect, useCallback } from "react";
import AdminOrdersClient from "./AdminOrdersClient";

type Order = {
  id: string;
  customerName?: string;
  email?: string;
  phone?: string;
  total: number;
  status: string;
  createdAt: string;
  courierBookingId?: string | null;
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "booking", label: "Booking" },
  { key: "packing", label: "Packing" },
  { key: "collection", label: "Collection" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("tab", activeTab);
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/admin/orders?${params}`)
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch((err) => setError(err.message ?? "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading && orders.length === 0) {
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

  return (
    <AdminOrdersClient
      orders={orders}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      search={search}
      onSearchChange={setSearch}
      onRefresh={fetchOrders}
    />
  );
}
