"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";

type AttributeValue = { id: string; value: string; sortOrder: number };
type Attribute = {
  id: string;
  name: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  sortOrder: number;
  values: AttributeValue[];
  _count?: { variantAttributes: number };
};

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [type, setType] = useState("select");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAttributes = async () => {
    try {
      const res = await fetch("/api/admin/attributes");
      if (res.ok) {
        const data = await res.json();
        setAttributes(data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load attributes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !displayName.trim()) {
      setMessage({ type: "error", text: "Name and display name are required" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || name.trim(),
          displayName: displayName.trim(),
          type,
          isRequired: false,
          sortOrder: attributes.length,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Attribute added" });
        setName("");
        setDisplayName("");
        fetchAttributes();
      } else {
        const d = await res.json();
        setMessage({ type: "error", text: d.error || "Failed to add" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attribute? Values will be removed.")) return;
    try {
      const res = await fetch(`/api/admin/attributes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Attribute deleted" });
        fetchAttributes();
      } else {
        setMessage({ type: "error", text: "Failed to delete" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
  };

  const handleAddValue = async (attrId: string) => {
    const v = (newValue[attrId] ?? "").trim();
    if (!v) return;
    try {
      const res = await fetch(`/api/admin/attributes/${attrId}/values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: v }),
      });
      if (res.ok) {
        setNewValue((prev) => ({ ...prev, [attrId]: "" }));
        fetchAttributes();
      } else {
        const d = await res.json();
        setMessage({ type: "error", text: d.error || "Failed to add value" });
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
  };

  const handleDeleteValue = async (attrId: string, valueId: string) => {
    if (!confirm("Delete this value?")) return;
    try {
      const res = await fetch(`/api/admin/attributes/${attrId}/values/${valueId}`, { method: "DELETE" });
      if (res.ok) fetchAttributes();
    } catch {
      setMessage({ type: "error", text: "Request failed" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full shrink-0 lg:w-80">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Add attribute</h2>
          <p className="mb-4 text-sm text-slate-600">
            Attributes are used for product variations (e.g. Color, Size, Weight).
          </p>
          {message && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name (slug)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!displayName) setDisplayName(e.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. Color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="select">Select</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add attribute
            </button>
          </form>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h1 className="text-lg font-semibold text-slate-900">Product attributes</h1>
          </div>
          <div className="divide-y divide-slate-200">
            {attributes.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No attributes yet. Add one using the form.</div>
            ) : (
              attributes.map((attr) => (
                <div key={attr.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-900">{attr.displayName}</span>
                      <span className="ml-2 text-sm text-slate-500">({attr.name})</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === attr.id ? null : attr.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(attr.id)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {expandedId === attr.id && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newValue[attr.id] ?? ""}
                          onChange={(e) => setNewValue((v) => ({ ...v, [attr.id]: e.target.value }))}
                          placeholder="Add value (e.g. Red, 500gm)"
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddValue(attr.id)}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
                          >
                            {v.value}
                            <button
                              type="button"
                              onClick={() => handleDeleteValue(attr.id, v.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {expandedId !== attr.id && attr.values.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {attr.values.slice(0, 5).map((v) => (
                        <span key={v.id} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {v.value}
                        </span>
                      ))}
                      {attr.values.length > 5 && (
                        <span className="text-xs text-slate-400">+{attr.values.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
