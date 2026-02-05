"use client";

import { CreditCard, Banknote, Smartphone } from "lucide-react";

const PROVIDERS = [
  { id: "cod", name: "Cash on Delivery (COD)", status: "active", desc: "Accept cash when order is delivered.", action: "Manage" },
  { id: "bkash", name: "bKash Payment Gateway", status: "inactive", desc: "Take payments via bKash PGW.", action: "Enable" },
  { id: "ssl", name: "SSLCOMMERZ", status: "inactive", desc: "Accept Debit/Credit cards, bKash, Nagad, Rocket and 33+ methods in Bangladesh.", action: "Enable" },
  { id: "nagad", name: "Nagad Payment Gateway", status: "inactive", desc: "Please fill up the form to configure.", action: "Enable" },
];

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  "not-supported": "bg-amber-100 text-amber-700",
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Payment providers</h1>
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option>Business location: Bangladesh</option>
        </select>
      </div>
      <p className="text-slate-600">
        Enable payment methods. COD is active; configure bKash, SSLCommerz, Nagad when ready.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((p) => (
          <div key={p.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  {p.id === "cod" ? <Banknote className="h-6 w-6 text-slate-600" /> : p.id === "bkash" || p.id === "nagad" ? <Smartphone className="h-6 w-6 text-slate-600" /> : <CreditCard className="h-6 w-6 text-slate-600" />}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status as keyof typeof STATUS_BADGE] ?? STATUS_BADGE.inactive}`}>
                    {p.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {p.action}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">{p.desc}</p>
          </div>
        ))}
      </div>

      <details className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-medium text-slate-900">More payment options</summary>
        <p className="mt-2 text-sm text-slate-600">Additional gateways can be added via plugins or custom integration.</p>
      </details>
    </div>
  );
}
