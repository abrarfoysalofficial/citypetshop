"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Mail,
  MessageSquare,
  Server,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

type HealthData = {
  database: string;
  prismaStatus: string;
  env: string;
  envMessage?: string;
  emailConfigured: boolean;
  smsConfigured: boolean;
  memoryUsageMB: { heapUsed: number; rss: number; external: number };
  systemMemoryMB: { free: number; total: number };
  diskFreeMB: number | null;
  uptimeSeconds: number;
  nodeVersion: string;
  buildVersion: string;
  timestamp: string;
};

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/system-health");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.status === 403) {
        setError("Access denied");
        return;
      }
      if (!res.ok) {
        setError("Failed to fetch health");
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
    fetchHealth();
  }, []);

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) =>
    ok ? (
      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">
        <CheckCircle2 className="w-4 h-4" /> {label}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-sm">
        <XCircle className="w-4 h-4" /> {label}
      </span>
    );

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-7 h-7" />
          System Health
        </h1>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <Database className="w-5 h-5" />
              <span className="font-medium">Database</span>
            </div>
            <StatusBadge ok={data.database === "connected"} label={data.database} />
            <div className="mt-1 text-xs text-slate-500">Prisma: {data.prismaStatus}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <Server className="w-5 h-5" />
              <span className="font-medium">Environment</span>
            </div>
            <StatusBadge ok={data.env === "ok"} label={data.env} />
            {data.envMessage && (
              <div className="mt-1 text-xs text-red-600">{data.envMessage}</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Email</span>
            </div>
            <StatusBadge ok={data.emailConfigured} label={data.emailConfigured ? "Configured" : "Not configured"} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">SMS</span>
            </div>
            <StatusBadge ok={data.smsConfigured} label={data.smsConfigured ? "Configured" : "Not configured"} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Cpu className="w-5 h-5" />
              <span className="font-medium">Process Memory</span>
            </div>
            <div className="text-sm text-slate-700">
              Heap: {data.memoryUsageMB.heapUsed} MB · RSS: {data.memoryUsageMB.rss} MB
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <HardDrive className="w-5 h-5" />
              <span className="font-medium">System Memory</span>
            </div>
            <div className="text-sm text-slate-700">
              Free: {data.systemMemoryMB.free} MB / {data.systemMemoryMB.total} MB
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <HardDrive className="w-5 h-5" />
              <span className="font-medium">Disk Free</span>
            </div>
            <div className="text-sm text-slate-700">
              {data.diskFreeMB != null ? `${data.diskFreeMB} MB` : "N/A"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Runtime</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            <span>Uptime: {formatUptime(data.uptimeSeconds)}</span>
            <span>Node: {data.nodeVersion}</span>
            <span>Build: v{data.buildVersion}</span>
            <span className="text-slate-500">Updated: {new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
