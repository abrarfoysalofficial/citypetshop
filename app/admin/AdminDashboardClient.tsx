"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  Activity,
  Package,
  Tag,
  Gift,
  FileText,
  Plug,
  Sliders,
  GripVertical,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCategories } from "@/context/CategoriesContext";
import { useBlog } from "@/context/BlogContext";
import { useOffers } from "@/context/OffersContext";
import { useVouchers } from "@/context/VouchersContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { DemoDashboard } from "@/src/data/types";

const DASHBOARD_LAYOUT_KEY = "city-plus-dashboard-layout";

const defaultLayout = [
  { id: "sales", visible: true },
  { id: "profit", visible: true },
  { id: "orders", visible: true },
  { id: "returnRate", visible: true },
  { id: "loss", visible: true },
  { id: "chartSales", visible: true },
  { id: "chartVisitors", visible: true },
  { id: "activity", visible: true },
];

const summaryCards = [
  { key: "sales", label: "Total Sales", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "profit", label: "Net Profit", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "orders", label: "Total Orders", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "returnRate", label: "Return Rate", icon: RotateCcw, color: "text-rose-600", bg: "bg-rose-50" },
  { key: "loss", label: "Loss Analysis", icon: AlertTriangle, color: "text-slate-600", bg: "bg-slate-100" },
];

const defaultSummary = { sales: "৳0", profit: "৳0", orders: "0", returnRate: "0%", loss: "৳0" };
const defaultSalesData = [
  { name: "Mon", sales: 0 }, { name: "Tue", sales: 0 }, { name: "Wed", sales: 0 },
  { name: "Thu", sales: 0 }, { name: "Fri", sales: 0 }, { name: "Sat", sales: 0 }, { name: "Sun", sales: 0 },
];
const defaultActivity = [{ id: 1, text: "No recent activity.", time: "—" }];

interface AdminDashboardClientProps {
  initialData?: DemoDashboard | null;
}

type LayoutItem = { id: string; visible: boolean };

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [summary, setSummary] = useState(initialData?.summary ?? defaultSummary);
  const [salesData, setSalesData] = useState(initialData?.salesData ?? defaultSalesData);
  const [activity, setActivity] = useState(initialData?.activity ?? defaultActivity);
  const [loading, setLoading] = useState(!initialData);
  const [layout, setLayout] = useState<LayoutItem[]>(defaultLayout);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { lastUpdated: categoriesUpdated } = useCategories();

  useEffect(() => {
    fetch("/api/admin/dashboard-layout")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.layout) && d.layout.length > 0) setLayout(d.layout);
      })
      .catch(() => {
        // No fallback
      });
  }, []);

  const saveLayout = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    fetch("/api/admin/dashboard-layout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: newLayout }),
    }).catch(() => {});
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(newLayout));
    } catch {
      //
    }
  }, []);

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const next = layout.slice();
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    saveLayout(next);
  };

  const toggleVisible = (id: string) => {
    const next = layout.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
    saveLayout(next);
  };
  const { lastUpdated: blogUpdated } = useBlog();
  const { lastUpdated: offersUpdated } = useOffers();
  const { lastUpdated: vouchersUpdated } = useVouchers();
  const lastUpdatedList = [
    { label: "Categories", value: categoriesUpdated },
    { label: "Blog", value: blogUpdated },
    { label: "Offers", value: offersUpdated },
    { label: "Vouchers", value: vouchersUpdated },
  ].filter((x) => x.value);

  useEffect(() => {
    if (initialData) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const supabase = createClient();
        const { data: orders } = await supabase.from("orders").select("id, total, status, created_at");
        type OrderRow = { id?: string; total?: number; status?: string; created_at?: string };
        const list = (Array.isArray(orders) ? orders : []) as OrderRow[];
        if (list.length > 0) {
          const totalSales = list.reduce((s: number, o: OrderRow) => s + Number(o.total ?? 0), 0);
          const returned = list.filter((o) => o.status === "returned").length;
          setSummary({
            sales: `৳${totalSales.toLocaleString("en-BD")}`,
            profit: "৳0",
            orders: String(list.length),
            returnRate: list.length ? `${((returned / list.length) * 100).toFixed(1)}%` : "0%",
            loss: "৳0",
          });
          setActivity(
            list.slice(0, 5).map((o, i) => ({
              id: i + 1,
              text: `Order #${String(o.id).slice(0, 8)} placed — ৳${Number(o.total).toLocaleString("en-BD")}`,
              time: new Date(o.created_at ?? 0).toLocaleString(),
            }))
          );
        }
      } catch {
        // keep defaults
      }
      setLoading(false);
    }
    load();
  }, [initialData]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard & Analytics</h1>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-slate-700">Quick links:</span>
        <Link href="/admin/categories" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Package className="h-4 w-4" /> Categories
        </Link>
        <Link href="/admin/products" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Package className="h-4 w-4" /> Products
        </Link>
        <Link href="/admin/offers" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Tag className="h-4 w-4" /> Offers
        </Link>
        <Link href="/admin/vouchers" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Gift className="h-4 w-4" /> Vouchers
        </Link>
        <Link href="/admin/blog" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <FileText className="h-4 w-4" /> Blog
        </Link>
        <Link href="/admin/tools" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Plug className="h-4 w-4" /> Tools & Plugins
        </Link>
        <Link href="/admin/advanced-settings" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
          <Sliders className="h-4 w-4" /> Advanced Settings
        </Link>
        {lastUpdatedList.length > 0 && (
          <span className="ml-auto text-xs text-slate-500">
            Content last updated: {new Date([...lastUpdatedList].sort((a, b) => (b.value!).localeCompare(a.value!))[0].value!).toLocaleString()}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500">Drag the handle to reorder widgets; click eye to show/hide. Layout is saved automatically.</p>

      <div className="space-y-4">
        {layout.map((item, index) => {
          if (!item.visible) return null;
          const isSummary = summaryCards.some((c) => c.key === item.id);
          const card = summaryCards.find((c) => c.key === item.id);
          const onDragStart = (e: React.DragEvent) => {
            setDraggedId(item.id);
            e.dataTransfer.setData("text/plain", String(index));
            e.dataTransfer.effectAllowed = "move";
          };
          const onDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          };
          const onDrop = (e: React.DragEvent) => {
            e.preventDefault();
            setDraggedId(null);
            const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
            if (from !== index) moveWidget(from, index);
          };

          const wrapper = (
            <div
              key={item.id}
              draggable
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={() => setDraggedId(null)}
              className={`flex items-start gap-2 rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity ${draggedId === item.id ? "opacity-60" : ""}`}
            >
              <div className="cursor-grab touch-none p-2 text-slate-400 hover:text-slate-600" title="Drag to reorder" aria-label="Drag to reorder">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                {isSummary && card && (
                  <div className={`rounded-xl border border-slate-200 p-4 ${card.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{card.label}</span>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <p className="mt-2 text-xl font-bold text-slate-900">{loading ? "—" : summary[card.key as keyof typeof summary]}</p>
                  </div>
                )}
                {item.id === "chartSales" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Sales (Last 7 Days)</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `৳${v}`} />
                          <Tooltip formatter={(v: number) => [`৳${v}`, "Sales"]} />
                          <Line type="monotone" dataKey="sales" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {item.id === "chartVisitors" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Visitors (Sample)</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Visits" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {item.id === "activity" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Activity className="h-5 w-5" />
                      Recent Activities
                    </h2>
                    <ul className="space-y-3">
                      {activity.map((act) => (
                        <li key={act.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                          <span className="text-sm text-slate-700">{act.text}</span>
                          <span className="text-xs text-slate-500">{act.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleVisible(item.id)}
                className="p-2 text-slate-400 hover:text-slate-600"
                title="Hide widget"
                aria-label="Hide widget"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
          );
          return wrapper;
        })}
      </div>

      {layout.some((i) => !i.visible) && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-700">Hidden widgets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {layout
              .filter((i) => !i.visible)
              .map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => toggleVisible(i.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <EyeOff className="h-4 w-4" />
                  {i.id}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
