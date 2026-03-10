export const dynamic = "force-dynamic";
import { getAdminDashboard } from "@/src/data/provider";
import { DollarSign, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react";
import { PageHero } from "@/components/admin/page-hero";

export default async function AdminReportsPage() {
  const dashboard = await getAdminDashboard();
  const summary = dashboard?.summary ?? { sales: "৳0", profit: "৳0", orders: "0", returnRate: "0%", loss: "৳0" };

  return (
    <div className="space-y-6">
      <PageHero
        title="Reports"
        description="Daily / weekly / monthly sales, profit, delivery cost, returns. Export CSV when backend is connected."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm bg-emerald-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total Sales</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{summary.sales}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Net Profit</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{summary.profit}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm bg-amber-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total Orders</span>
            <ShoppingCart className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{summary.orders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm bg-rose-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Return Rate</span>
            <RotateCcw className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{summary.returnRate}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm bg-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Loss</span>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900">{summary.loss}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sample chart</h2>
        <p className="mt-2 text-sm text-slate-600">Connect backend for daily/weekly/monthly breakdown and CSV export.</p>
      </div>
    </div>
  );
}
