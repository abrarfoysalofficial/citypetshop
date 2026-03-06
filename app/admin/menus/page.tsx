"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";

type NavItem = { label: string; href: string; openInNewTab?: boolean; visible?: boolean };

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
          const toItem = (x: { label?: string; label_en?: string; href?: string; openInNewTab?: boolean; visible?: boolean }) =>
            ({ label: x.label ?? x.label_en ?? "", href: x.href ?? "", openInNewTab: x.openInNewTab ?? false, visible: x.visible !== false });
          const nl = Array.isArray(d.navbar_links) ? d.navbar_links : Array.isArray(d.navbarLinks) ? d.navbarLinks : [];
          const fl = Array.isArray(d.footer_links) ? d.footer_links : Array.isArray(d.footerLinks) ? d.footerLinks : [];
          setNavbarLinks(nl.map((x: Record<string, unknown>) => toItem(x as { label?: string; label_en?: string; href?: string; openInNewTab?: boolean; visible?: boolean })));
          setFooterLinks(fl.map((x: Record<string, unknown>) => toItem(x as { label?: string; label_en?: string; href?: string; openInNewTab?: boolean; visible?: boolean })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = (target: "navbar" | "footer") => {
    if (target === "navbar") setNavbarLinks([...navbarLinks, { label: "", href: "", openInNewTab: false, visible: true }]);
    else setFooterLinks([...footerLinks, { label: "", href: "", openInNewTab: false, visible: true }]);
  };

  const updateItem = (target: "navbar" | "footer", idx: number, field: "label" | "href" | "openInNewTab" | "visible", value: string | boolean) => {
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

  const moveItem = (target: "navbar" | "footer", idx: number, dir: "up" | "down") => {
    if (target === "navbar") {
      const arr = [...navbarLinks];
      const ni = dir === "up" ? idx - 1 : idx + 1;
      if (ni < 0 || ni >= arr.length) return;
      [arr[idx], arr[ni]] = [arr[ni]!, arr[idx]!];
      setNavbarLinks(arr);
    } else {
      const arr = [...footerLinks];
      const ni = dir === "up" ? idx - 1 : idx + 1;
      if (ni < 0 || ni >= arr.length) return;
      [arr[idx], arr[ni]] = [arr[ni]!, arr[idx]!];
      setFooterLinks(arr);
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
          navbar_links: navbarLinks.filter((l) => l.label.trim() && l.href.trim()).map((l) => ({ label: l.label, href: l.href, openInNewTab: l.openInNewTab, visible: l.visible })),
          footer_links: footerLinks.filter((l) => l.label.trim() && l.href.trim()).map((l) => ({ label: l.label, href: l.href, openInNewTab: l.openInNewTab, visible: l.visible })),
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
            <div key={idx} className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => moveItem("navbar", idx, "up")} disabled={idx === 0} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveItem("navbar", idx, "down")} disabled={idx === navbarLinks.length - 1} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem("navbar", idx, "label", e.target.value)}
                placeholder="Label"
                className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem("navbar", idx, "href", e.target.value)}
                placeholder="/path"
                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={item.openInNewTab ?? false} onChange={(e) => updateItem("navbar", idx, "openInNewTab", e.target.checked)} className="h-3.5 w-3.5 rounded" />
                New tab
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateItem("navbar", idx, "visible", e.target.checked)} className="h-3.5 w-3.5 rounded" />
                Visible
              </label>
              <button type="button" onClick={() => removeItem("navbar", idx)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Remove">
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
            <div key={idx} className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => moveItem("footer", idx, "up")} disabled={idx === 0} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => moveItem("footer", idx, "down")} disabled={idx === footerLinks.length - 1} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40" aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem("footer", idx, "label", e.target.value)}
                placeholder="Label"
                className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem("footer", idx, "href", e.target.value)}
                placeholder="/path"
                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={item.openInNewTab ?? false} onChange={(e) => updateItem("footer", idx, "openInNewTab", e.target.checked)} className="h-3.5 w-3.5 rounded" />
                New tab
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateItem("footer", idx, "visible", e.target.checked)} className="h-3.5 w-3.5 rounded" />
                Visible
              </label>
              <button type="button" onClick={() => removeItem("footer", idx)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Remove">
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
