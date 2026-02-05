import Link from "next/link";
import { getAdminOrderById } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";
import { notFound } from "next/navigation";
import OrderNotesBlock from "./OrderNotesBlock";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = DATA_SOURCE === "local" ? await getAdminOrderById(id) : null;
  if (!order) {
    if (DATA_SOURCE === "local") notFound();
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-slate-900">Order #{id.slice(0, 8)}</h1>
        <p className="text-slate-600">Connect backend for full workflow.</p>
        <Link href="/admin/orders" className="inline-block text-primary hover:underline">← Orders</Link>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && <OrderNotesBlock orderId={id} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Order {order.id}</h1>
        <Link href="/admin/orders" className="text-primary hover:underline">← Back to Orders</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Details</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">Customer</dt><dd className="font-medium text-slate-900">{order.customerName ?? order.email ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Status</dt><dd><span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{order.status}</span></dd></div>
            <div><dt className="text-slate-500">Total</dt><dd className="font-medium text-slate-900">৳{order.total.toLocaleString("en-BD")}</dd></div>
            <div><dt className="text-slate-500">Payment</dt><dd className="text-slate-700">{order.paymentMethod ?? "—"}</dd></div>
            <div><dt className="text-slate-500">Date</dt><dd className="text-slate-700">{new Date(order.createdAt).toLocaleString()}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Shipping</h2>
          <p className="text-sm text-slate-700">{order.shippingAddress ?? "—"}</p>
        </div>
      </div>
      {order.items && order.items.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Items</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200"><th className="p-2 text-left font-medium text-slate-900">Product</th><th className="p-2 text-right font-medium text-slate-900">Qty</th><th className="p-2 text-right font-medium text-slate-900">Price</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-2 text-slate-700">{item.name}</td>
                  <td className="p-2 text-right">{item.qty}</td>
                  <td className="p-2 text-right">৳{item.price.toLocaleString("en-BD")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-3">
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Print invoice (mock)</button>
        <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Courier booking (mock)</button>
      </div>
      {process.env.NEXT_PUBLIC_SUPABASE_URL && <OrderNotesBlock orderId={order.id} />}
    </div>
  );
}
