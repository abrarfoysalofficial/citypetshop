export const dynamic = "force-dynamic";
import { getAdminAuditLogs } from "@/src/data/provider";

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
      <p className="text-slate-600">Order edits, refunds, voucher/payment/courier changes.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Action</th>
              <th className="p-3 font-medium text-slate-900">Entity</th>
              <th className="p-3 font-medium text-slate-900">Details</th>
              <th className="p-3 font-medium text-slate-900">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  No audit logs. Use DATA_SOURCE=local for demo data.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{log.action}</td>
                  <td className="p-3 text-slate-600">{log.entity ?? "—"}</td>
                  <td className="p-3 text-slate-600">{log.details ?? "—"}</td>
                  <td className="p-3 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
