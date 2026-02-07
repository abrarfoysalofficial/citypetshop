"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { PackageSearch, MessageSquare, Truck, User } from "lucide-react";
import { isValidBdPhone } from "@/lib/phone-bd";
import { createClient } from "@/lib/supabase/client";

type OrderSummary = { id: string; status: string; total: number; createdAt: string; customerName?: string; phone?: string };
type Note = { id: string; type: string; visibility: string; message: string; created_at: string };
type Event = { id: string; status: string; provider?: string; created_at: string; payload_summary?: unknown };

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [source, setSource] = useState<"local" | "supabase">("local");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const fetchTrack = useCallback(
    async (q: string, token: string | null = null) => {
      if (!q.trim()) return;
      setError("");
      setLoading(true);
      const isPhone = /^[\d+\s\-()]+$/.test(q) && q.replace(/\D/g, "").length >= 10;
      if (isPhone && !isValidBdPhone(q)) {
        setError("Enter a valid Bangladesh phone (e.g. 01XXXXXXXXX)");
        setLoading(false);
        return;
      }
      try {
        const url = new URL("/api/track-order", window.location.origin);
        url.searchParams.set("q", q.trim());
        if (token) url.searchParams.set("otp_token", token);
        const res = await fetch(url.toString());
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");
        setOrders(data.orders || []);
        setNotes(data.notes || []);
        setEvents(data.events || []);
        setSource(data.source || "local");
        setRequiresOtp(!!data.requiresOtp);
        setSelectedOrderId(data.orders?.[0]?.id || null);
        if (data.requiresOtp && !token) setOtpStep("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setOrders([]);
        setNotes([]);
        setEvents([]);
        setRequiresOtp(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLL_FALLBACK_MS = 10000;

  useEffect(() => {
    if (source !== "supabase" || !selectedOrderId || orders.length === 0 || requiresOtp) return;
    const orderIds = orders.map((o) => o.id);
    const supabase = createClient();
    const onInsert = () => fetchTrack(query, otpToken);
    let sub: { unsubscribe?: () => void } | null = null;
    if ("channel" in supabase && typeof (supabase as { channel: (n: string) => unknown }).channel === "function") {
      const ch = (supabase as {
        channel: (n: string) => {
          on: (ev: string, opts: Record<string, string>, cb: () => void) => unknown;
          subscribe: () => { unsubscribe?: () => void };
        };
      }).channel("track-order-timeline");
      orderIds.forEach((orderId) => {
        ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "order_notes", filter: `order_id=eq.${orderId}` }, onInsert);
        ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "order_status_events", filter: `order_id=eq.${orderId}` }, onInsert);
      });
      sub = ch.subscribe?.() ?? null;
    }
    pollIntervalRef.current = setInterval(() => fetchTrack(query, otpToken), POLL_FALLBACK_MS);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      sub?.unsubscribe?.();
    };
  }, [source, selectedOrderId, query, fetchTrack, orders, requiresOtp, otpToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrack(query);
  };

  const filteredNotes = selectedOrderId ? notes.filter((n) => (n as { order_id?: string }).order_id === selectedOrderId) : notes;
  const filteredEvents = selectedOrderId ? events.filter((e) => (e as { order_id?: string }).order_id === selectedOrderId) : events;
  type TimelineItem =
    | { kind: "event"; text: string; time: string; provider?: string; authorType: "System" }
    | { kind: "note"; text: string; time: string; authorType: "Admin" | "Courier" | "System"; visibility: string };
  const timeline: TimelineItem[] = [
    ...filteredEvents.map(
      (ev): TimelineItem => ({
        kind: "event",
        text: ev.status,
        time: ev.created_at,
        provider: ev.provider,
        authorType: "System",
      })
    ),
    ...filteredNotes
      .filter((n) => n.visibility === "public")
      .map(
        (n): TimelineItem => ({
          kind: "note",
          text: n.message,
          time: n.created_at,
          authorType: n.type === "courier" ? "Courier" : n.type === "admin" ? "Admin" : "System",
          visibility: n.visibility,
        })
      ),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <PackageSearch className="h-8 w-8 text-primary" />
        Track Order
      </h1>
      <p className="mt-2 text-slate-600">
        Enter your Order ID or phone number to track delivery.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="tracking" className="block text-sm font-medium text-slate-700">
            Order ID / Phone Number
          </label>
          <input
            id="tracking"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ORD-1001 or 01XXXXXXXXX"
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {orders.length > 0 && requiresOtp && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">Verify your phone to see full details</h3>
          <p className="mt-1 text-sm text-amber-800">We&apos;ll send a one-time code to your number. Name and address are hidden until verified.</p>
          {otpStep === "idle" && (
            <button
              type="button"
              onClick={async () => {
                setOtpError("");
                setOtpSending(true);
                try {
                  const res = await fetch("/api/track-order/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: query.trim() }),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setOtpError((data as { error?: string }).error || "Failed to send");
                    return;
                  }
                  setOtpStep("sent");
                } finally {
                  setOtpSending(false);
                }
              }}
              disabled={otpSending}
              className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {otpSending ? "Sending…" : "Send OTP"}
            </button>
          )}
          {otpStep === "sent" && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm font-medium text-amber-900">Enter 6-digit code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  placeholder="000000"
                  className="w-28 rounded-lg border border-amber-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (otpCode.length !== 6) {
                      setOtpError("Enter 6 digits");
                      return;
                    }
                    setOtpError("");
                    setOtpVerifying(true);
                    try {
                      const res = await fetch("/api/track-order/verify-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: query.trim(), code: otpCode }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setOtpError((data as { error?: string }).error || "Invalid code");
                        return;
                      }
                      const token = (data as { token?: string }).token;
                      if (token) {
                        setOtpToken(token);
                        setOtpStep("verified");
                        await fetchTrack(query, token);
                      }
                    } finally {
                      setOtpVerifying(false);
                    }
                  }}
                  disabled={otpVerifying || otpCode.length !== 6}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {otpVerifying ? "Verifying…" : "Verify"}
                </button>
              </div>
              {otpError && <p className="text-sm text-rose-600">{otpError}</p>}
            </div>
          )}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 space-y-4">
          {orders.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Select order</label>
              <select
                value={selectedOrderId || ""}
                onChange={(e) => setSelectedOrderId(e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} — ৳{o.total.toLocaleString()} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedOrderId && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Order updates</h3>
              {timeline.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">No updates yet. Status and notes will appear here.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {timeline.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      {u.authorType === "Admin" && <User className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                      {u.authorType === "Courier" && <Truck className="h-4 w-4 shrink-0 text-accent" aria-hidden />}
                      {u.authorType === "System" && <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-500">[{u.authorType}]</span> {u.text}
                        {u.kind === "note" && u.visibility === "public" && (
                          <span className="ml-1 text-xs text-slate-400">(visible to customer)</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{new Date(u.time).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && orders.length === 0 && query && !error && (
        <p className="mt-4 text-sm text-slate-600">No orders found. Check your Order ID or phone number.</p>
      )}

      <Link href="/" className="mt-6 inline-block text-sm font-medium text-secondary hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
