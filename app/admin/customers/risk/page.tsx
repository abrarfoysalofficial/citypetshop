"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Phone, MapPin } from "lucide-react";

type Risk = {
  phone: string;
  name: string | null;
  orderCount: number;
  addressCount: number;
  codCount: number;
  codTotal: number;
  hasDuplicateAddress: boolean;
  lastOrderId?: string;
};

export default function AdminCustomerRiskPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers/risk")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.risks) setRisks(d.risks);
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
        <h1 className="text-2xl font-bold text-slate-900">Customer Risk Profile</h1>
        <Link href="/admin/customers" className="text-sm font-medium text-blue-600 hover:underline">
          ← All Customers
        </Link>
      </div>
      <p className="text-slate-600">
        Customers with duplicate addresses, high COD totals, or multiple orders. Review for fraud.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {risks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No risk profiles flagged.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Customer</th>
                <th className="p-4 font-medium text-slate-700">Orders</th>
                <th className="p-4 font-medium text-slate-700">Addresses</th>
                <th className="p-4 font-medium text-slate-700">COD</th>
                <th className="p-4 font-medium text-slate-700">Flags</th>
                <th className="p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risks.map((r) => (
                <tr key={r.phone} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{r.name ?? "—"}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        {r.phone}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">{r.orderCount}</td>
                  <td className="p-4">
                    <span className={r.addressCount > 1 ? "text-amber-600 font-medium" : ""}>
                      {r.addressCount}
                    </span>
                  </td>
                  <td className="p-4">
                    {r.codCount > 0 ? (
                      <span className={r.codTotal > 5000 ? "text-amber-600 font-medium" : ""}>
                        {r.codCount} orders, ৳{r.codTotal.toLocaleString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {r.hasDuplicateAddress && (
                        <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          <MapPin className="h-3 w-3" />
                          Multiple addresses
                        </span>
                      )}
                      {r.codTotal > 5000 && (
                        <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          High COD
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {r.lastOrderId && (
                      <Link
                        href={`/admin/orders/${r.lastOrderId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View order
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
