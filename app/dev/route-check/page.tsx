"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/shop", label: "Shop" },
  { path: "/login", label: "User Login" },
  { path: "/account", label: "Account (requires login)" },
  { path: "/account/orders", label: "Account Orders" },
  { path: "/account/invoices", label: "Account Invoices" },
  { path: "/account/returns", label: "Account Returns" },
  { path: "/admin/login", label: "Admin Login" },
  { path: "/admin", label: "Admin Dashboard (requires admin)" },
  { path: "/admin/orders", label: "Admin Orders" },
  { path: "/admin/orders/ORD-1001", label: "Admin Order Detail" },
  { path: "/admin/products", label: "Admin Products" },
  { path: "/admin/products/new", label: "Admin New Product" },
  { path: "/admin/products/bulk", label: "Admin Bulk Products" },
  { path: "/admin/categories", label: "Admin Categories" },
  { path: "/admin/brands", label: "Admin Brands" },
  { path: "/admin/inventory", label: "Admin Inventory" },
  { path: "/admin/combo-offers", label: "Admin Combo Offers" },
  { path: "/admin/offers", label: "Admin Offers" },
  { path: "/admin/vouchers", label: "Admin Vouchers" },
  { path: "/admin/blog", label: "Admin Blog" },
  { path: "/admin/blog/new", label: "Admin New Blog" },
  { path: "/admin/pages", label: "Admin Pages" },
  { path: "/admin/menus", label: "Admin Menus" },
  { path: "/admin/theme", label: "Admin Theme" },
  { path: "/admin/checkout-settings", label: "Admin Checkout Settings" },
  { path: "/admin/payments", label: "Admin Payments" },
  { path: "/admin/courier", label: "Admin Courier" },
  { path: "/admin/tracking", label: "Admin Tracking" },
  { path: "/admin/reports", label: "Admin Reports" },
  { path: "/admin/customers", label: "Admin Customers" },
  { path: "/admin/roles-permissions", label: "Admin Roles" },
  { path: "/admin/audit-logs", label: "Admin Audit Logs" },
  { path: "/admin/settings", label: "Admin Settings" },
  { path: "/blog", label: "Blog" },
  { path: "/combo-offers", label: "Combo Offers" },
  { path: "/track-order", label: "Track Order" },
];

export default function DevRouteCheckPage() {
  const [statuses, setStatuses] = useState<Record<string, "pending" | "ok" | "error">>({});
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev) return;
    ROUTES.forEach(({ path }) => {
      setStatuses((s) => ({ ...s, [path]: "pending" }));
      fetch(path, { method: "HEAD", cache: "no-store" })
        .then((res) => setStatuses((s) => ({ ...s, [path]: res.ok ? "ok" : "error" })))
        .catch(() => setStatuses((s) => ({ ...s, [path]: "error" })));
    });
  }, [isDev]);

  if (!isDev) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Not Available</h1>
        <p className="mt-2 text-slate-600">This page is only available in development (NODE_ENV=development).</p>
        <Link href="/" className="mt-6 inline-block text-primary hover:underline">← Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Route Check (DEV only)</h1>
      <p className="mt-2 text-sm text-slate-600">All required routes. Status: HEAD request (OK = 2xx; protected routes may redirect).</p>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Route</th>
              <th className="p-3 font-medium text-slate-900">Label</th>
              <th className="p-3 font-medium text-slate-900">Status</th>
              <th className="p-3 font-medium text-slate-900">Open</th>
            </tr>
          </thead>
          <tbody>
            {ROUTES.map((r) => (
              <tr key={r.path} className="border-b border-slate-100">
                <td className="p-3 font-mono text-slate-900">{r.path}</td>
                <td className="p-3 text-slate-700">{r.label}</td>
                <td className="p-3">
                  {statuses[r.path] === "pending" && <span className="text-amber-600">Checking…</span>}
                  {statuses[r.path] === "ok" && <span className="text-emerald-600 font-medium">OK</span>}
                  {statuses[r.path] === "error" && <span className="text-rose-600">Needs attention</span>}
                  {!statuses[r.path] && <span className="text-slate-400">—</span>}
                </td>
                <td className="p-3">
                  <Link href={r.path} className="font-medium text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">Protected routes (/admin/*, /account/*) may return 307 redirect to login when not authenticated; that is expected.</p>
      <Link href="/" className="mt-6 inline-block text-primary hover:underline">← Home</Link>
    </div>
  );
}
