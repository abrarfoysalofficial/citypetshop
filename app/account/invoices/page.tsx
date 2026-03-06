export const dynamic = "force-dynamic";
import Link from "next/link";
import { auth } from "@lib/auth";
import { getUserInvoices } from "@/src/data/provider";

export default async function AccountInvoicesPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const invoices = await getUserInvoices(userId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Invoices</h2>
      <p className="text-slate-600">
        Invoices for your orders. Download PDF from each row.
      </p>
      {invoices.length === 0 ? (
        <p className="text-slate-600">No invoices yet. Invoices are generated when orders are placed.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Invoice #</th>
                <th className="p-3 font-medium text-slate-900">Order</th>
                <th className="p-3 font-medium text-slate-900">Date</th>
                <th className="p-3 font-medium text-slate-900">Total</th>
                <th className="p-3 font-medium text-slate-900">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="p-3 font-mono font-medium text-slate-900">{inv.number}</td>
                  <td className="p-3 text-slate-700">{inv.orderId}</td>
                  <td className="p-3 text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-slate-900">৳{inv.total.toLocaleString("en-BD")}</td>
                  <td className="p-3">
                    <a href={inv.downloadUrl ?? "#"} download className="font-medium text-primary hover:underline">Download PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/account/orders" className="inline-block font-semibold text-primary hover:underline">View Orders →</Link>
    </div>
  );
}
