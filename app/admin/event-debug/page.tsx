"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bug,
  Loader2,
  RefreshCw,
  Search,
  Mail,
  MessageSquare,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

type EventDebugData = {
  analyticsEvents: Array<{
    id: string;
    eventName: string;
    eventId: string | null;
    source: string;
    pageUrl: string | null;
    createdAt: string;
    payloadSummary: unknown;
  }>;
  notificationLogs: Array<{
    id: string;
    type: string;
    channel: string;
    orderId: string;
    recipient: string | null;
    provider: string | null;
    messageId: string | null;
    createdAt: string;
  }>;
  failedNotifications: Array<{
    id: string;
    type: string;
    channel: string;
    orderId: string;
    recipient: string | null;
    createdAt: string;
  }>;
  failedWebhooks: Array<{
    id: string;
    orderId: string;
    gateway: string;
    status: string;
    createdAt: string;
  }>;
};

export default function EventDebugPage() {
  const [data, setData] = useState<EventDebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set("event", eventFilter);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/event-debug?${params}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.status === 403) {
        setError("Access denied");
        return;
      }
      if (!res.ok) {
        setError("Failed to fetch");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bug className="w-7 h-7" />
          Event Debug
        </h1>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Filter by event name"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-48"
        />
        <input
          type="text"
          placeholder="Filter by notification type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-48"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {data.failedNotifications.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Failed Notifications ({data.failedNotifications.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Channel</th>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Recipient</th>
                    <th className="px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.failedNotifications.map((n) => (
                    <tr key={n.id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{n.type}</td>
                      <td className="px-4 py-2">{n.channel}</td>
                      <td className="px-4 py-2 font-mono text-xs">{n.orderId.slice(-8)}</td>
                      <td className="px-4 py-2">{n.recipient ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500">{new Date(n.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {data.failedWebhooks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-red-600" />
              Failed Webhooks ({data.failedWebhooks.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Gateway</th>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.failedWebhooks.map((w) => (
                    <tr key={w.id} className="border-t border-slate-100">
                      <td className="px-4 py-2">{w.gateway}</td>
                      <td className="px-4 py-2 font-mono text-xs">{w.orderId.slice(-8)}</td>
                      <td className="px-4 py-2 text-red-600">{w.status}</td>
                      <td className="px-4 py-2 text-slate-500">{new Date(w.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5" />
            Last 50 Notification Logs
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Channel</th>
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Recipient</th>
                  <th className="px-4 py-2 text-left">Provider</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.notificationLogs.map((n) => (
                  <tr key={n.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{n.type}</td>
                    <td className="px-4 py-2">{n.channel}</td>
                    <td className="px-4 py-2 font-mono text-xs">{n.orderId.slice(-8)}</td>
                    <td className="px-4 py-2">{n.recipient ?? "—"}</td>
                    <td className="px-4 py-2">{n.provider ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5" />
            Last 50 Analytics Events (dedup: eventId)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">Event ID</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Page</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.analyticsEvents.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{e.eventName}</td>
                    <td className="px-4 py-2 font-mono text-xs">{e.eventId ? e.eventId.slice(0, 8) + "…" : "—"}</td>
                    <td className="px-4 py-2">{e.source}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]" title={e.pageUrl ?? ""}>{e.pageUrl ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(e.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
