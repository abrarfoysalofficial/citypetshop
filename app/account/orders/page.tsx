import Link from "next/link";
import { getUserOrders } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";

export default async function AccountOrdersPage() {
  const orders = DATA_SOURCE === "local" ? await getUserOrders() : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-slate-600">
          You have not placed any orders yet. When you do, they will appear here. Guest orders can be tracked using the order ID from your confirmation.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="p-3 font-mono font-medium text-slate-900">{o.id}</td>
                  <td className="p-3">৳{o.total.toLocaleString("en-BD")}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{o.status}</span>
                  </td>
                  <td className="p-3 text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link href={`/account/orders/${o.id}`} className="font-medium text-primary hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/shop" className="inline-block font-semibold text-primary hover:underline">
        Start Shopping →
      </Link>
    </div>
  );
}
