export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserOrderById } from "@/src/data/provider";
import { notFound } from "next/navigation";
import { OrderActions } from "./OrderActions";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const order = await getUserOrderById(id, userId);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Order {order.id}</h2>
        <Link href="/account/orders" className="font-medium text-primary hover:underline">← Back to Orders</Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Status</dt><dd><span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{order.status}</span></dd></div>
          <div><dt className="text-slate-500">Total</dt><dd className="font-medium text-slate-900">৳{order.total.toLocaleString("en-BD")}</dd></div>
          <div><dt className="text-slate-500">Date</dt><dd className="text-slate-700">{new Date(order.createdAt).toLocaleString()}</dd></div>
          <div><dt className="text-slate-500">Payment</dt><dd className="text-slate-700">{order.paymentMethod ?? "—"}</dd></div>
        </dl>
      </div>
      {order.shippingAddress && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Shipping address</h3>
          <p className="mt-1 text-sm text-slate-700">{order.shippingAddress}</p>
        </div>
      )}
      {order.items && order.items.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Items</h3>
          <ul className="mt-2 space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.name} × {item.qty}</span>
                <span className="font-medium text-slate-900">৳{(item.price * item.qty).toLocaleString("en-BD")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/invoice?orderId=${encodeURIComponent(order.id)}`}
          download
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Download invoice
        </a>
        <OrderActions orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}
