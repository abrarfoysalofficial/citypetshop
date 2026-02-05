"use client";

import React, { useState, useEffect } from "react";

type EventRow = {
  id: string;
  event_name: string;
  event_id: string | null;
  source: string;
  page_url: string | null;
  created_at: string;
  has_email_hash: boolean;
  has_phone_hash: boolean;
  has_fbp: boolean;
  has_fbc: boolean;
  payload_summary?: unknown;
};

const META_EVENT_NAMES = ["ViewContent", "Search", "AddToCart", "InitiateCheckout", "AddPaymentInfo", "Purchase"];

function escapeCsvCell(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lastReceivedByEvent, setLastReceivedByEvent] = useState<Record<string, string>>({});
  const [diagnostics, setDiagnostics] = useState<{ pixelConfigured: boolean; capiConfigured: boolean; warnings: string[] }>({
    pixelConfigured: false,
    capiConfigured: false,
    warnings: [],
  });
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (eventFilter) params.set("event", eventFilter);
    fetch(`/api/admin/analytics/events?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setCounts(d.counts || {});
        setLastReceivedByEvent(d.lastReceivedByEvent || {});
        setDiagnostics(d.diagnostics || { pixelConfigured: false, capiConfigured: false, warnings: [] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [eventFilter, fromDate, toDate]);

  const [debugExpanded, setDebugExpanded] = useState<string | null>(null);

  const exportCsv = () => {
    const headers = ["Event", "Source", "Page URL", "Time", "Dedup", "Match quality"];
    const rows = events.map((e) => [
      e.event_name,
      e.source,
      e.page_url || "",
      new Date(e.created_at).toISOString(),
      e.event_id ? "yes" : "no",
      [e.has_email_hash && "email", e.has_phone_hash && "phone", e.has_fbp && "fbp", e.has_fbc && "fbc"].filter(Boolean).join(", "),
    ]);
    const csv = [headers.map(escapeCsvCell).join(","), ...rows.map((r) => r.map(escapeCsvCell).join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-events-${fromDate || "all"}-${toDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analytics & Events</h1>
      <p className="text-slate-600">
        Event data similar to Meta Events Manager. Standard events: ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase.
      </p>

      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Event name</span>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1"
          >
            <option value="">All events</option>
            {META_EVENT_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">From</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded border border-slate-300 px-2 py-1" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">To</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded border border-slate-300 px-2 py-1" />
        </label>
        <div className="flex items-end gap-2">
          <button onClick={fetchEvents} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Refresh
          </button>
          <button onClick={exportCsv} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Export CSV
          </button>
        </div>
      </div>

      {diagnostics.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 font-semibold text-amber-900">Diagnostics</h2>
          <ul className="list-inside list-disc text-sm text-amber-800">
            {diagnostics.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-700">Configure Pixel/CAPI in Admin → Settings or via env (NEXT_PUBLIC_FB_PIXEL_ID, FACEBOOK_CAPI_TOKEN).</p>
        </div>
      )}

      {Object.keys(counts).length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Event counts (date range)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-2 font-medium text-slate-900">Event</th>
                  <th className="p-2 font-medium text-slate-900">Count</th>
                  <th className="p-2 font-medium text-slate-900">Last received</th>
                </tr>
              </thead>
              <tbody>
                {META_EVENT_NAMES.map((name) => (
                  <tr key={name} className="border-b border-slate-100">
                    <td className="p-2 font-medium text-slate-800">{name}</td>
                    <td className="p-2 text-slate-600">{counts[name] ?? 0}</td>
                    <td className="p-2 text-slate-500">{lastReceivedByEvent[name] ? new Date(lastReceivedByEvent[name]).toLocaleString() : "—"}</td>
                  </tr>
                ))}
                {Object.keys(counts)
                  .filter((n) => !META_EVENT_NAMES.includes(n))
                  .map((name) => (
                    <tr key={name} className="border-b border-slate-100">
                      <td className="p-2 font-medium text-slate-800">{name}</td>
                      <td className="p-2 text-slate-600">{counts[name]}</td>
                      <td className="p-2 text-slate-500">{lastReceivedByEvent[name] ? new Date(lastReceivedByEvent[name]).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 p-4 text-lg font-semibold text-slate-900">Event Debug Panel</h2>
        <p className="border-b border-slate-200 px-4 pb-3 text-sm text-slate-600">
          Last 200 events. Source: browser/server. Dedup: event_id present = dedup applied. Export CSV for full list.
        </p>
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-slate-500">No events. Wire captureEvent() in Cart/Checkout/Product pages and connect Supabase.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-3 font-medium text-slate-900">Event</th>
                  <th className="p-3 font-medium text-slate-900">Source</th>
                  <th className="p-3 font-medium text-slate-900">Page</th>
                  <th className="p-3 font-medium text-slate-900">Time</th>
                  <th className="p-3 font-medium text-slate-900">Dedup</th>
                  <th className="p-3 font-medium text-slate-900">Match quality</th>
                  <th className="p-3 font-medium text-slate-900">Debug</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <React.Fragment key={e.id}>
                    <tr className="border-b border-slate-100">
                      <td className="p-3 font-medium text-slate-900">{e.event_name}</td>
                      <td className="p-3 text-slate-600">{e.source}</td>
                      <td className="max-w-xs truncate p-3 text-slate-600">{e.page_url || "—"}</td>
                      <td className="p-3 text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
                      <td className="p-3 text-xs">{e.event_id ? "yes" : "no"}</td>
                      <td className="p-3 text-xs">
                        {[e.has_email_hash && "email", e.has_phone_hash && "phone", e.has_fbp && "fbp", e.has_fbc && "fbc"].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-3">
                        {e.payload_summary != null ? (
                          <button
                            type="button"
                            onClick={() => setDebugExpanded(debugExpanded === e.id ? null : e.id)}
                            className="text-xs font-medium text-brand hover:underline"
                          >
                            {debugExpanded === e.id ? "Hide" : "Payload"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                    {debugExpanded === e.id && e.payload_summary != null && (
                      <tr>
                        <td colSpan={7} className="bg-slate-50 p-3">
                          <pre className="max-h-32 overflow-auto rounded bg-slate-100 p-2 text-xs">{JSON.stringify(e.payload_summary, null, 2)}</pre>
                          <p className="mt-1 text-xs text-slate-500">Dedup: {e.event_id ? "event_id present" : "no event_id"}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
