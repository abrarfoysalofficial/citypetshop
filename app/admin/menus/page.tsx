"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";

type NavItem = { label: string; href: string };

export default function AdminMenusPage() {
  const [navbarLinks, setNavbarLinks] = useState<NavItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setNavbarLinks(Array.isArray(d.navbar_links) ? d.navbar_links : Array.isArray(d.navbarLinks) ? d.navbarLinks : []);
          setFooterLinks(Array.isArray(d.footer_links) ? d.footer_links : Array.isArray(d.footerLinks) ? d.footerLinks : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = (target: "navbar" | "footer") => {
    if (target === "navbar") setNavbarLinks([...navbarLinks, { label: "", href: "" }]);
    else setFooterLinks([...footerLinks, { label: "", href: "" }]);
  };

  const updateItem = (target: "navbar" | "footer", idx: number, field: "label" | "href", value: string) => {
    if (target === "navbar") {
      const next = [...navbarLinks];
      next[idx] = { ...next[idx]!, [field]: value };
      setNavbarLinks(next);
    } else {
      const next = [...footerLinks];
      next[idx] = { ...next[idx]!, [field]: value };
      setFooterLinks(next);
    }
  };

  const removeItem = (target: "navbar" | "footer", idx: number) => {
    if (target === "navbar") setNavbarLinks(navbarLinks.filter((_, i) => i !== idx));
    else setFooterLinks(footerLinks.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          navbar_links: navbarLinks.filter((l) => l.label.trim() && l.href.trim()),
          footer_links: footerLinks.filter((l) => l.label.trim() && l.href.trim()),
        }),
      });
      if (res.ok) setMsg({ ok: true, text: "Menu settings saved" });
      else setMsg({ ok: false, text: "Failed to save" });
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
      <h1 className="text-2xl font-bold text-slate-900">Menu Settings</h1>
      <p className="text-slate-600">Manage header and footer navigation links.</p>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Header Navbar</h2>
          {navbarLinks.map((item, idx) => (
            <div key={idx} className="mb-4 flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem("navbar", idx, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem("navbar", idx, "href", e.target.value)}
                placeholder="/path"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem("navbar", idx)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("navbar")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add link
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Footer Links</h2>
          {footerLinks.map((item, idx) => (
            <div key={idx} className="mb-4 flex gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem("footer", idx, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem("footer", idx, "href", e.target.value)}
                placeholder="/path"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem("footer", idx)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("footer")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add link
          </button>
        </div>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save
      </button>
    </div>
  );
}
