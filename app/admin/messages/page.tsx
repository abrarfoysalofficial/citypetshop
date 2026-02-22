"use client";

import { useState, useEffect, useCallback } from "react";

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  channel: string;
  status: string;
  guestPhone?: string | null;
  guestEmail?: string | null;
  customerId?: string | null;
  updatedAt: string;
  messages: Message[];
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  escalated: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-600",
};

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");

  const fetchConversations = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/conversations?status=${statusFilter}&pageSize=50`)
      .then((r) => {
        if (r.status === 401) { window.location.href = "/admin/login"; return null; }
        return r.json();
      })
      .then((d) => { if (d) setConversations(d.conversations ?? []); })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openConversation = (conv: Conversation) => {
    fetch(`/api/admin/conversations/${conv.id}`)
      .then((r) => r.json())
      .then((d) => setSelected(d));
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    await fetch(`/api/admin/conversations/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText }),
    });
    setReplyText("");
    const d = await fetch(`/api/admin/conversations/${selected.id}`).then((r) => r.json());
    setSelected(d);
    setSending(false);
  };

  const getAiDraft = async () => {
    if (!selected) return;
    setSending(true);
    const res = await fetch(`/api/admin/conversations/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiDraft: true }),
    });
    const data = await res.json();
    if (data.draft) setReplyText(data.draft);
    setSending(false);
  };

  const updateStatus = async (convId: string, status: string) => {
    await fetch(`/api/admin/conversations/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchConversations();
    if (selected?.id === convId) setSelected((prev) => prev ? { ...prev, status } : prev);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-white">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold mb-2">Messages</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="open">Open</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
            <option value="">All</option>
          </select>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-400 p-8 text-sm">No conversations</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                  selected?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{conv.channel}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[conv.status] ?? ""}`}>
                    {conv.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {conv.guestPhone ?? conv.guestEmail ?? conv.customerId ?? "Unknown"}
                </p>
                {conv.messages[0] && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{conv.messages[0].content}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(conv.updatedAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selected ? (
          <>
            <div className="px-6 py-3 border-b bg-white flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selected.guestPhone ?? selected.guestEmail ?? selected.customerId ?? "Unknown"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {selected.channel} · {selected.status}
                </p>
              </div>
              <div className="flex gap-2">
                {selected.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(selected.id, "closed")}
                    className="text-xs border px-3 py-1 rounded hover:bg-gray-100"
                  >
                    Close
                  </button>
                )}
                {selected.status === "open" && (
                  <button
                    onClick={() => updateStatus(selected.id, "escalated")}
                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Escalate
                  </button>
                )}
                {selected.status !== "open" && (
                  <button
                    onClick={() => updateStatus(selected.id, "open")}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {(selected.messages ?? []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "human" || msg.role === "assistant" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-sm rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-white border text-gray-800"
                        : msg.role === "human"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-100 text-purple-900"
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-70 capitalize">{msg.role}</p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {selected.status !== "closed" && (
              <div className="p-4 border-t bg-white">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply..."
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={getAiDraft}
                    disabled={sending}
                    title="Generate AI draft reply"
                    className="px-3 py-1.5 border rounded text-xs text-purple-700 border-purple-300 hover:bg-purple-50 disabled:opacity-50"
                  >
                    ✨ AI Draft
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50 hover:bg-blue-700"
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
