"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";

type Campaign = {
  id: string;
  platform: string;
  campaignId?: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  conversions: number;
  date: string;
};

export default function AdminAdManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    platform: "meta",
    campaignId: "",
    impressions: 0,
    clicks: 0,
    spend: 0,
    revenue: 0,
    conversions: 0,
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = useCallback(() => {
    const params = new URLSearchParams();
    if (platform) params.set("platform", platform);
    fetch(`/api/admin/ad-campaigns?${params}`)
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) setCampaigns(d);
      })
      .finally(() => setLoading(false));
  }, [platform]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ad-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          campaignId: form.campaignId || undefined,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchCampaigns();
      } else {
        const d = await res.json();
        alert(d.error ?? "Failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ad Management</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Campaign
        </button>
      </div>
      <p className="text-slate-600">
        Track ad campaign performance (Meta, TikTok, Google).
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Filter by platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="meta">Meta</option>
          <option value="tiktok">TikTok</option>
          <option value="google">Google</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No campaign data yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="p-4 font-medium text-slate-700">Date</th>
                <th className="p-4 font-medium text-slate-700">Platform</th>
                <th className="p-4 font-medium text-slate-700">Impressions</th>
                <th className="p-4 font-medium text-slate-700">Clicks</th>
                <th className="p-4 font-medium text-slate-700">Spend</th>
                <th className="p-4 font-medium text-slate-700">Revenue</th>
                <th className="p-4 font-medium text-slate-700">Conversions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-4">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{c.platform}</td>
                  <td className="p-4">{c.impressions.toLocaleString()}</td>
                  <td className="p-4">{c.clicks.toLocaleString()}</td>
                  <td className="p-4">৳{Number(c.spend).toLocaleString()}</td>
                  <td className="p-4">৳{Number(c.revenue).toLocaleString()}</td>
                  <td className="p-4">{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Add Campaign Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="meta">Meta</option>
                  <option value="tiktok">TikTok</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impressions</label>
                  <input
                    type="number"
                    min={0}
                    value={form.impressions}
                    onChange={(e) => setForm({ ...form, impressions: parseInt(e.target.value, 10) || 0 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Clicks</label>
                  <input
                    type="number"
                    min={0}
                    value={form.clicks}
                    onChange={(e) => setForm({ ...form, clicks: parseInt(e.target.value, 10) || 0 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Spend (৳)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.spend}
                    onChange={(e) => setForm({ ...form, spend: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Revenue (৳)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.revenue}
                    onChange={(e) => setForm({ ...form, revenue: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
