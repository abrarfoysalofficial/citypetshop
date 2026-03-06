"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";

type ProviderStatus = {
  sms: { configured: boolean; provider: string | null };
  email: { configured: boolean; provider: string | null };
  envVars: { sms: string[]; email: string[] };
};

type LogEntry = {
  id: string;
  type: string;
  channel: string;
  recipient: string | null;
  sentAt: string;
  provider: string | null;
};

const TEMPLATES = [
  {
    name: "Order Confirmation (Email)",
    channel: "email",
    example: "Order Confirmed! Order #ABC12345. Total: ৳1,500. Track at: /track-order",
  },
  {
    name: "Order Status Update (SMS)",
    channel: "sms",
    example: "Your order #ABC12345 has been shipped. Tracking: XXXXX. City Plus Pet Shop.",
  },
  {
    name: "Track Order OTP (SMS)",
    channel: "sms",
    example: "Your City Plus Pet Shop verification code is: 123456. Valid for 10 minutes. Do not share.",
  },
];

export default function AdminNotificationsPage() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/notifications/status").then((r) => r.json()),
      fetch("/api/admin/notifications/logs?limit=20").then((r) => r.json()),
    ])
      .then(([statusData, logsData]) => {
        setStatus(statusData);
        setLogs(Array.isArray(logsData) ? logsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
      <p className="text-slate-600">
        Configure SMS and email providers via environment variables. Track-order OTP and order status updates use the chosen provider.
      </p>

      {/* Provider status */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Bell className="h-5 w-5" />
          Provider Status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-slate-500" />
              <div>
                <p className="font-medium text-slate-800">SMS</p>
                <p className="text-sm text-slate-500">
                  {status?.sms.configured
                    ? `Using ${status.sms.provider}`
                    : "Not configured"}
                </p>
              </div>
            </div>
            {status?.sms.configured ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-amber-500" />
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-slate-500" />
              <div>
                <p className="font-medium text-slate-800">Email</p>
                <p className="text-sm text-slate-500">
                  {status?.email.configured
                    ? `Using ${status.email.provider}`
                    : "Not configured"}
                </p>
              </div>
            </div>
            {status?.email.configured ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-amber-500" />
            )}
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Required env vars:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>SMS: {status?.envVars?.sms?.join(", ") ?? "BULK_SMS_BD_API_KEY or TWILIO_*"}</li>
            <li>Email: {status?.envVars?.email?.join(", ") ?? "RESEND_API_KEY, EMAIL_FROM"}</li>
          </ul>
        </div>
      </section>

      {/* Templates */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Template Examples</h2>
        <p className="mb-4 text-sm text-slate-600">
          These are the notification templates used by the system. Content is generated dynamically.
        </p>
        <div className="space-y-4">
          {TEMPLATES.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <p className="mb-1 font-medium text-slate-800">{t.name}</p>
              <p className="text-sm text-slate-600">Example:</p>
              <code className="mt-1 block rounded bg-slate-100 px-2 py-2 text-xs text-slate-700">
                {t.example}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Recent logs */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Recent Notification Logs</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No notifications sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 font-medium text-slate-600">Type</th>
                  <th className="py-2 font-medium text-slate-600">Channel</th>
                  <th className="py-2 font-medium text-slate-600">Recipient</th>
                  <th className="py-2 font-medium text-slate-600">Sent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{log.type}</td>
                    <td className="py-2">{log.channel}</td>
                    <td className="py-2 text-slate-600">{log.recipient ?? "—"}</td>
                    <td className="py-2 text-slate-500">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
