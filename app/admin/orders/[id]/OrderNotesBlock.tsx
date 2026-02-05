"use client";

import { useState, useEffect, useCallback } from "react";

type Note = { id: string; type: string; visibility: string; message: string; created_at: string };

export default function OrderNotesBlock({ orderId }: { orderId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState<"internal" | "public">("internal");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/order-notes?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json().catch(() => ({}));
      setNotes(data.notes || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/order-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type: "admin", visibility, message: message.trim() }),
      });
      if (res.ok) {
        setMessage("");
        fetchNotes();
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Notes & Timeline</h2>
      <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "internal" | "public")}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="internal">Internal</option>
            <option value="public">Customer-visible</option>
          </select>
          <button
            type="submit"
            disabled={adding || !message.trim()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
      {loading ? (
        <p className="text-sm text-slate-500">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-500">No notes yet. Add one above.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm">
              <span className="font-medium text-slate-600">{n.type}</span>
              <span className="mx-2 text-slate-400">•</span>
              <span className={n.visibility === "public" ? "text-amber-600" : ""}>{n.visibility}</span>
              <p className="mt-1 text-slate-800">{n.message}</p>
              <p className="mt-0.5 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
