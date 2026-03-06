"use client";

import { useState, useEffect, useCallback } from "react";

type PolicyType = {
  blockThreshold: number;
  otpThreshold: number;
  manualReviewThreshold: number;
  phoneVelocityLimit: number;
};

function PolicyEditor({
  policy,
  onSaved,
}: {
  policy: PolicyType;
  onSaved: () => void;
}) {
  const [blockThreshold, setBlockThreshold] = useState(String(policy.blockThreshold ?? 60));
  const [otpThreshold, setOtpThreshold] = useState(String(policy.otpThreshold ?? 40));
  const [manualReviewThreshold, setManualReviewThreshold] = useState(String(policy.manualReviewThreshold ?? 30));
  const [phoneVelocityLimit, setPhoneVelocityLimit] = useState(String(policy.phoneVelocityLimit ?? 3));
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const block = parseInt(blockThreshold, 10);
    const otp = parseInt(otpThreshold, 10);
    const manual = parseInt(manualReviewThreshold, 10);
    const velocity = parseInt(phoneVelocityLimit, 10);
    if (isNaN(block) || isNaN(otp) || isNaN(manual) || isNaN(velocity)) return;
    setSaving(true);
    fetch("/api/admin/fraud/policy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockThreshold: block,
        otpThreshold: otp,
        manualReviewThreshold: manual,
        phoneVelocityLimit: velocity,
      }),
    })
      .then((r) => r.json())
      .then(() => onSaved())
      .finally(() => setSaving(false));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Policy thresholds</h2>
      <form onSubmit={handleSave} className="grid max-w-md gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Block threshold (score ≥)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={blockThreshold}
            onChange={(e) => setBlockThreshold(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">OTP threshold (score ≥)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={otpThreshold}
            onChange={(e) => setOtpThreshold(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Manual review threshold</label>
          <input
            type="number"
            min={0}
            max={100}
            value={manualReviewThreshold}
            onChange={(e) => setManualReviewThreshold(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone velocity limit (orders/24h)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={phoneVelocityLimit}
            onChange={(e) => setPhoneVelocityLimit(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save thresholds"}
          </button>
        </div>
      </form>
    </div>
  );
}

type FraudFlag = {
  id: string;
  orderId: string;
  flagType: string;
  score: number;
  reviewStatus: string;
  createdAt: string;
  order?: { id: string; shippingName: string; guestPhone: string; total: number };
};

export default function AdminFraudPage() {
  const [flags, setFlags] = useState<{ id: string; orderId: string; flagType: string; score: number; createdAt: string }[]>([]);
  const [reviewQueue, setReviewQueue] = useState<FraudFlag[]>([]);
  const [blockedIps, setBlockedIps] = useState<{ id: string; ip: string; reason: string | null; expiresAt: string | null }[]>([]);
  const [policy, setPolicy] = useState<PolicyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockIp, setBlockIp] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(() => {
    Promise.all([
      fetch("/api/admin/fraud").then((r) => (r.status === 401 ? null : r.json())),
      fetch("/api/admin/fraud/review?status=pending").then((r) => (r.status === 401 ? null : r.json())),
      fetch("/api/admin/fraud/policy").then((r) => (r.status === 401 ? null : r.json())),
    ]).then(([fraud, review, pol]) => {
      if (fraud) {
        setFlags(fraud.flags ?? []);
        setBlockedIps(fraud.blockedIps ?? []);
      }
      if (review) setReviewQueue(review.flags ?? []);
      if (pol) setPolicy(pol.policy);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBlockIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockIp.trim()) return;
    setSubmitting(true);
    fetch("/api/admin/fraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: blockIp.trim(), reason: blockReason.trim() || "Manual block" }),
    })
      .then((r) => r.json())
      .then(() => {
        setBlockIp("");
        setBlockReason("");
        fetchData();
      })
      .finally(() => setSubmitting(false));
  };

  const handleUnblock = (id: string) => {
    const ok = confirm("Unblock this IP?");
    if (!ok) return;
    fetch(`/api/admin/fraud/blocked/${id}`, { method: "DELETE" })?.then(() => fetchData());
  };

  const handleReview = (flagId: string, action: "approve" | "reject") => {
    fetch(`/api/admin/fraud/flags/${flagId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).then(() => fetchData());
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Fraud & Security</h1>
      <p className="text-slate-600">
        Fraud flags, blocklist, policy thresholds, and review queue.
      </p>

      {policy && (
        <PolicyEditor
          policy={policy}
          onSaved={() => {
            fetch("/api/admin/fraud/policy")
              .then((r) => r.json())
              .then((d) => d.policy && setPolicy(d.policy));
          }}
        />
      )}

      {reviewQueue.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Review queue ({reviewQueue.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">Order</th>
                  <th className="pb-2 font-medium text-slate-900">Flag</th>
                  <th className="pb-2 font-medium text-slate-900">Score</th>
                  <th className="pb-2 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewQueue.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2">
                      <a href={`/admin/orders/${f.orderId}`} className="font-mono text-blue-600 hover:underline">{f.orderId.slice(0, 8)}</a>
                    </td>
                    <td className="py-2 text-slate-600">{f.flagType}</td>
                    <td className="py-2 font-medium text-slate-900">{f.score}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => handleReview(f.id, "approve")}
                        className="mr-2 text-xs font-medium text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(f.id, "reject")}
                        className="text-xs font-medium text-rose-600 hover:underline"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Block IP</h2>
        <form onSubmit={handleBlockIp} className="flex flex-wrap gap-4">
          <input
            type="text"
            value={blockIp}
            onChange={(e) => setBlockIp(e.target.value)}
            placeholder="IP address"
            className="rounded border border-slate-300 px-3 py-2"
          />
          <input
            type="text"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            placeholder="Reason (optional)"
            className="rounded border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Block
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Blocked IPs</h2>
        {blockedIps.length === 0 ? (
          <p className="text-slate-500">No blocked IPs.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">IP</th>
                  <th className="pb-2 font-medium text-slate-900">Reason</th>
                  <th className="pb-2 font-medium text-slate-900">Expires</th>
                  <th className="pb-2 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-700">{b.ip}</td>
                    <td className="py-2 text-slate-600">{b.reason ?? "—"}</td>
                    <td className="py-2 text-slate-500">{b.expiresAt ? new Date(b.expiresAt).toLocaleString() : "Never"}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => handleUnblock(b.id)}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent fraud flags</h2>
        {flags.length === 0 ? (
          <p className="text-slate-500">No fraud flags.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 font-medium text-slate-900">Order</th>
                  <th className="pb-2 font-medium text-slate-900">Flag</th>
                  <th className="pb-2 font-medium text-slate-900">Score</th>
                  <th className="pb-2 font-medium text-slate-900">Time</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2 font-mono text-slate-700">{f.orderId.slice(0, 8)}</td>
                    <td className="py-2 text-slate-600">{f.flagType}</td>
                    <td className="py-2 font-medium text-slate-900">{f.score}</td>
                    <td className="py-2 text-slate-500">{new Date(f.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
