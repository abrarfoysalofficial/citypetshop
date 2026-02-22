export const dynamic = "force-dynamic";
import Link from "next/link";
import { getUserAccountOverview } from "@/src/data/provider";

export default async function AccountPage() {
  const data = await getUserAccountOverview();

  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm text-slate-600 sm:text-base">
        Welcome, {data.profile.name || data.profile.email}. View your orders, download invoices, and manage returns.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Link href="/account/orders" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
          <h2 className="font-semibold text-slate-900">Orders</h2>
          <p className="mt-1 text-2xl font-bold text-primary">{data.orderCount}</p>
          <p className="mt-1 text-sm text-slate-600">View purchase history and track orders</p>
        </Link>
        <Link href="/account/invoices" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
          <h2 className="font-semibold text-slate-900">Invoices</h2>
          <p className="mt-1 text-sm text-slate-600">Download invoices for your orders</p>
        </Link>
        <Link href="/account/returns" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
          <h2 className="font-semibold text-slate-900">Returns</h2>
          <p className="mt-1 text-sm text-slate-600">Request returns and refunds</p>
        </Link>
        <Link href="/track-order" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
          <h2 className="font-semibold text-slate-900">Track Order</h2>
          <p className="mt-1 text-sm text-slate-600">Track your parcel with order ID</p>
        </Link>
      </div>
      {data.recentOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
          <ul className="mt-3 space-y-2">
            {data.recentOrders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <Link href={`/account/orders/${o.id}`} className="font-medium text-primary hover:underline">{o.id}</Link>
                <span className="text-sm text-slate-600">৳{o.total.toLocaleString("en-BD")} · {o.status}</span>
              </li>
            ))}
          </ul>
          <Link href="/account/orders" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">View all orders →</Link>
        </div>
      )}
    </div>
  );
}
