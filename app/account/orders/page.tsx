import Link from "next/link";
import { getUserOrders } from "@/src/data/provider";
import { PackageSearch } from "lucide-react";

function getStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "pending" || s === "processing") return "bg-amber-100 text-amber-800 ring-1 ring-amber-200/60";
  if (s === "handed_to_courier" || s === "shipped") return "bg-blue-100 text-blue-800 ring-1 ring-blue-200/60";
  if (s === "delivered") return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60";
  if (s === "cancelled" || s === "returned") return "bg-red-100 text-red-800 ring-1 ring-red-200/60";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60";
}

export default async function AccountOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-slate-600">
          You have not placed any orders yet. When you do, they will appear here. Guest orders can be tracked using the order ID from your confirmation.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-3 font-medium text-slate-900">Order</th>
                  <th className="p-3 font-medium text-slate-900">Total</th>
                  <th className="p-3 font-medium text-slate-900">Status</th>
                  <th className="p-3 font-medium text-slate-900">Date</th>
                  <th className="p-3 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-sm font-medium text-slate-900">{o.id.length > 12 ? `${o.id.slice(0, 8)}…` : o.id}</td>
                    <td className="p-3 font-medium">৳{o.total.toLocaleString("en-BD")}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadgeClass(o.status)}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/track-order?orderId=${encodeURIComponent(o.id)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <PackageSearch className="h-3.5 w-3.5" />
                          Track
                        </Link>
                        <Link href={`/account/orders/${o.id}`} className="font-medium text-primary hover:underline">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Link href="/shop" className="inline-block font-semibold text-primary hover:underline">
        Start Shopping →
      </Link>
    </div>
  );
}
