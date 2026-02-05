import Link from "next/link";
import { getUserReturns } from "@/src/data/provider";
import { DATA_SOURCE } from "@/src/config/runtime";

export default async function AccountReturnsPage() {
  const returns = DATA_SOURCE === "local" ? await getUserReturns() : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Returns & Refunds</h2>
      <p className="text-slate-600">
        Request returns and refunds. Our refund policy is on the Refund & Return Policy page.
      </p>
      {returns.length === 0 ? (
        <p className="text-slate-600">No return requests yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-3 font-medium text-slate-900">Return ID</th>
                <th className="p-3 font-medium text-slate-900">Order</th>
                <th className="p-3 font-medium text-slate-900">Status</th>
                <th className="p-3 font-medium text-slate-900">Reason</th>
                <th className="p-3 font-medium text-slate-900">Requested</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="p-3 font-mono font-medium text-slate-900">{r.id}</td>
                  <td className="p-3 text-slate-700">{r.orderId}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{r.status}</span>
                  </td>
                  <td className="p-3 text-slate-600">{r.reason ?? "—"}</td>
                  <td className="p-3 text-slate-600">{new Date(r.requestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/refund" className="mt-4 inline-block font-semibold text-primary hover:underline">Refund & Return Policy →</Link>
      <Link href="/contact" className="mt-4 ml-6 inline-block font-semibold text-primary hover:underline">Contact Us →</Link>
    </div>
  );
}
