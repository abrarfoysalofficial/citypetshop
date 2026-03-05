"use client";

import { useState } from "react";
import { Mail, Save } from "lucide-react";

const EMAIL_NOTIFICATIONS = [
  { id: "new-order", name: "New order", enabled: true, recipient: "Admin", contentType: "text/html" },
  { id: "cancelled-order-admin", name: "Cancelled order (to Admin)", enabled: true, recipient: "Admin", contentType: "text/html" },
  { id: "cancelled-order-customer", name: "Cancelled order (to Customer)", enabled: false, recipient: "Customer", contentType: "text/html" },
  { id: "failed-order-admin", name: "Failed order (to Admin)", enabled: true, recipient: "Admin", contentType: "text/html" },
  { id: "processing-order", name: "Processing order", enabled: true, recipient: "Customer", contentType: "text/html" },
  { id: "completed-order", name: "Completed order", enabled: true, recipient: "Customer", contentType: "text/html" },
  { id: "refunded-order", name: "Refunded order", enabled: true, recipient: "Customer", contentType: "text/html" },
  { id: "reset-password", name: "Reset password", enabled: true, recipient: "Customer", contentType: "text/html" },
  { id: "new-account", name: "New account", enabled: true, recipient: "Customer", contentType: "text/html" },
];

export default function AdminEmailsPage() {
  const [fromName, setFromName] = useState("City Plus Pet Shop");
  const [fromAddress, setFromAddress] = useState(process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "admin@citypetshop.bd");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Email notifications</h1>
      <p className="text-slate-600">
        Email notifications sent from the store are listed below. Click Manage to configure. Connect SMTP or Resend for delivery.
      </p>

      {/* Sender options */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Mail className="h-5 w-5" /> Email sender options
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">From name</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">From address</label>
            <input
              type="email"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Save className="h-4 w-4" /> {saved ? "Saved" : "Save"}
        </button>
      </section>

      {/* Notifications table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="p-3 font-medium text-slate-900">Email</th>
              <th className="p-3 font-medium text-slate-900">Content type</th>
              <th className="p-3 font-medium text-slate-900">Recipient(s)</th>
              <th className="p-3 font-medium text-slate-900">Manage</th>
            </tr>
          </thead>
          <tbody>
            {EMAIL_NOTIFICATIONS.map((e) => (
              <tr key={e.id} className="border-b border-slate-100">
                <td className="p-3">
                  <span className="font-medium text-slate-900">{e.name}</span>
                  <span className="ml-2">{e.enabled ? "✓" : "✗"}</span>
                </td>
                <td className="p-3 text-slate-600">{e.contentType}</td>
                <td className="p-3 text-slate-600">{e.recipient}</td>
                <td className="p-3">
                  <button type="button" className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
