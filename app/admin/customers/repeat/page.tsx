"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, ShoppingBag } from "lucide-react";

type RepeatCustomer = {
  phone: string;
  name: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  lastOrderId: string;
  codOrderCount: number;
  codTotal: number;
};

export default function RepeatCustomersPage() {
  const [customers, setCustomers] = useState<RepeatCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers/repeat")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.customers) setCustomers(d.customers);
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
        <h1 className="text-2xl font-bold text-slate-900">Repeat Customers</h1>
        <Link href="/admin/customers" className="text-sm font-medium text-blue-600 hover:underline">
          ← All Customers
        </Link>
      </div>
      <p className="text-slate-600">
        Customers with 2+ orders. COD risk = high COD order count / total amount.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No repeat customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-4 font-medium text-slate-700">Customer</th>
                  <th className="p-4 font-medium text-slate-700">Orders</th>
                  <th className="p-4 font-medium text-slate-700">Total Spent</th>
                  <th className="p-4 font-medium text-slate-700">Last Order</th>
                  <th className="p-4 font-medium text-slate-700">COD</th>
                  <th className="p-4 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.phone} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </p>
                        {c.email && (
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {c.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 font-medium">
                        <ShoppingBag className="h-4 w-4" />
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="p-4">৳{c.totalSpent.toLocaleString()}</td>
                    <td className="p-4 text-slate-600">
                      {new Date(c.lastOrderAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {c.codOrderCount > 0 ? (
                        <span
                          className={
                            c.codTotal > 5000
                              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                              : "text-slate-600"
                          }
                        >
                          {c.codOrderCount} orders, ৳{c.codTotal.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <a
                        href={`https://wa.me/88${c.phone.replace(/\D/g, "").slice(-11)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                      <span className="mx-2 text-slate-300">|</span>
                      <Link
                        href={`/admin/orders/${c.lastOrderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
