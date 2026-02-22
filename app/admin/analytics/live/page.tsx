"use client";

import { useState, useEffect, useCallback } from "react";

export default function AdminLiveAnalyticsPage() {
  const [data, setData] = useState<{
    liveVisitorCount: number;
    pageTraffic: Record<string, number>;
    recentEvents: { event: string; page: string; at: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    fetch("/api/admin/analytics/live")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const pageTraffic = data?.pageTraffic ?? {};
  const pages = Object.entries(pageTraffic).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Live Visitors</h1>
      <p className="text-slate-600">
        Real-time visitors (last 5 minutes). Refreshes every 10 seconds.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Live visitors now</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data?.liveVisitorCount ?? 0}
          </p>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Page traffic</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">Page</th>
                  <th className="pb-2 font-medium text-slate-900">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(([url, count]) => (
                  <tr key={url} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-700">{url}</td>
                    <td className="py-2 font-medium text-slate-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.recentEvents && data.recentEvents.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent events</h2>
          <ul className="space-y-2">
            {data.recentEvents.slice(0, 10).map((e, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="font-medium text-slate-800">{e.event}</span>
                <span className="text-slate-500">{e.page}</span>
                <span className="text-slate-400">{new Date(e.at).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
