"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Search, ArrowUpDown, Eye, Download } from "lucide-react";
import type { OrderStatus } from "@/lib/schema";

type Order = { 
  id: string; 
  customerName?: string; 
  email?: string; 
  total: number; 
  status: string; 
  createdAt: string 
};

const STATUS_OPTIONS = ["All Status", "Pending", "Processing", "Shipped", "Handed to Courier", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  handed_to_courier: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-slate-100 text-slate-700",
};

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState<"createdAt" | "total">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter and sort
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "All Status" || 
        o.status?.toLowerCase() === statusFilter.toLowerCase().replace(/ /g, "_");
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = sortBy === "createdAt" ? new Date(a.createdAt).getTime() : a.total;
      let bVal: any = sortBy === "createdAt" ? new Date(b.createdAt).getTime() : b.total;
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: "createdAt" | "total") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-slate-600">{filteredOrders.length} of {orders.length} orders</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-4 shadow-lg shadow-slate-200/50 border border-slate-100"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, customer name, or email..."
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Order ID</th>
                <th className="p-4 font-medium text-slate-700">Customer</th>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("total")}
                    className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                  >
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium text-slate-700">Status</th>
                <th className="p-4">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <p className="font-medium">No orders found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-medium text-slate-900">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{order.customerName ?? "Guest"}</p>
                        {order.email && (
                          <p className="text-xs text-slate-500">{order.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updatingStatus === order.id}
                        className={`rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-blue-500/20 ${
                          STATUS_COLORS[order.status.toLowerCase().replace(/ /g, "_")] ?? "bg-slate-100 text-slate-700"
                        } ${updatingStatus === order.id ? "opacity-50" : ""}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="handed_to_courier">Handed to Courier</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                      {updatingStatus === order.id && (
                        <Loader2 className="inline-block ml-2 h-3 w-3 animate-spin" />
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/track-order?orderId=${order.id}`}
                          target="_blank"
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                          title="Track Order"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {!order.id.startsWith("ORD-") && (
                          <a
                            href={`/api/invoice?orderId=${order.id}`}
                            download
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
