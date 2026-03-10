"use client";

import { useState } from "react";
import Link from "next/link";
import type { DemoCustomer } from "@/src/data/types";
import { PageHero } from "@/components/admin/page-hero";

export function AdminCustomersClient({ customers }: { customers: DemoCustomer[] }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const matchSearch = !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-4">
      <PageHero
        title="Customers"
        description="Customer list and contact info. Use filters and search below."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers" }]}
        actions={
          <Link href="/admin/users/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Add User
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white">
          {["all", "customer"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 text-sm font-medium capitalize ${roleFilter === r ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {r === "all" ? `All (${customers.length})` : "Customer"}
            </button>
          ))}
        </div>
        <div className="flex flex-1 min-w-[200px] items-center gap-2">
          <input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Search
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Name</th>
              <th className="p-3 font-medium text-slate-900">Email</th>
              <th className="p-3 font-medium text-slate-900">Phone</th>
              <th className="p-3 font-medium text-slate-900">Orders</th>
              <th className="p-3 font-medium text-slate-900">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No customers match.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.email}</td>
                  <td className="p-3 text-slate-600">{c.phone ?? "—"}</td>
                  <td className="p-3">{c.ordersCount}</td>
                  <td className="p-3 text-slate-600">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
