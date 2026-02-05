"use client";

import { useState } from "react";

const TEMPLATES = ["Simple", "Modern", "Minimal"];

export default function AdminInvoicesPage() {
  const [viewMode, setViewMode] = useState("browser");
  const [paperSize, setPaperSize] = useState("A4");
  const [template, setTemplate] = useState("Simple");
  const [inkSaving, setInkSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="w-full lg:w-96 shrink-0 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Display settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">How do you want to view the PDF?</label>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="browser">Open the PDF in a new browser tab/window</option>
                <option value="download">Download PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Paper size</label>
              <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Choose a template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={inkSaving} onChange={(e) => setInkSaving(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Ink saving mode</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Test mode (use latest settings for all documents)</span>
            </label>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Shop information</h3>
          <p className="mt-1 text-xs text-slate-600">Used on invoice header. Edit in Settings → Store details.</p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option>Invoice</option>
            </select>
            <span className="text-sm text-slate-500">Currently showing last order</span>
            <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              PDF
            </button>
          </div>
          <div className="min-h-[400px] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">Invoice preview will appear here when an order exists.</p>
            <p className="mt-2 text-sm text-slate-500">Configure shop info and template above, then generate from Orders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
