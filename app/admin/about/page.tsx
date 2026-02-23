"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, User, Users, Loader2, Plus, Trash2 } from "lucide-react";

type Founder = {
  id: string;
  name: string;
  title: string;
  bioEn: string | null;
  bioBn: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  imageUrl: string | null;
  isActive: boolean;
} | null;

type TeamMember = {
  id: string;
  name: string;
  title: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminAboutPage() {
  const [founder, setFounder] = useState<Founder>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [founderForm, setFounderForm] = useState({
    name: "Sheikh Shakil",
    title: "Founder",
    bioEn: "",
    phone: "",
    whatsapp: "",
    imageUrl: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [fRes, tRes] = await Promise.all([
        fetch("/api/admin/about-founder"),
        fetch("/api/admin/about-team"),
      ]);
      if (fRes.ok) {
        const f = await fRes.json();
        setFounder(f);
        if (f) {
          setFounderForm({
            name: f.name ?? "",
            title: f.title ?? "",
            bioEn: f.bioEn ?? "",
            phone: f.phone ?? "",
            whatsapp: f.whatsapp ?? "",
            imageUrl: f.imageUrl ?? "",
          });
        }
      }
      if (tRes.ok) {
        const t = await tRes.json();
        setTeam(Array.isArray(t) ? t : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const saveFounder = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/about-founder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: founderForm.name,
          title: founderForm.title,
          bioEn: founderForm.bioEn || undefined,
          phone: founderForm.phone || undefined,
          whatsapp: founderForm.whatsapp || undefined,
          imageUrl: founderForm.imageUrl || undefined,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to save");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">About Page</h1>
        <p className="mt-1 text-slate-600">Manage founder profile and team members for the About page.</p>
        <Link href="/about" target="_blank" className="mt-2 inline-block text-sm text-primary hover:underline">
          View About page →
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Founder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <User className="h-5 w-5" />
          Founder
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={founderForm.name}
              onChange={(e) => setFounderForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={founderForm.title}
              onChange={(e) => setFounderForm((p) => ({ ...p, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Bio (English/Bengali)</label>
            <textarea
              value={founderForm.bioEn}
              onChange={(e) => setFounderForm((p) => ({ ...p, bioEn: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                value={founderForm.phone}
                onChange={(e) => setFounderForm((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
              <input
                type="text"
                value={founderForm.whatsapp}
                onChange={(e) => setFounderForm((p) => ({ ...p, whatsapp: e.target.value }))}
                placeholder="880XXXXXXXXXX"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Image URL</label>
            <input
              type="text"
              value={founderForm.imageUrl}
              onChange={(e) => setFounderForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="/api/media/about-images/..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">Use /team/founder.jpg or upload via Admin → Upload, then paste URL (e.g. /api/media/about-images/...).</p>
          </div>
          <button
            onClick={saveFounder}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Founder
          </button>
        </div>
      </div>

      {/* Team */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5" />
          Team Members
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Add team members (e.g. developers, partners). Default: Abrar Foysal (Fresher IT BD).
        </p>
        <div className="mt-4 space-y-3">
          {team.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{m.name}</p>
                <p className="text-sm text-slate-600">{m.title}</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm("Delete this team member?")) return;
                  const res = await fetch(`/api/admin/about-team/${m.id}`, { method: "DELETE" });
                  if (res.ok) await load();
                }}
                className="rounded p-2 text-rose-600 hover:bg-rose-50"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {team.length === 0 && (
            <p className="text-sm text-slate-500">
              No team members yet. The About page will show the default developer credit.
            </p>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          To add team members, use the API: POST /api/admin/about-team with name, title, email, whatsapp, imageUrl.
        </p>
      </div>
    </div>
  );
}
