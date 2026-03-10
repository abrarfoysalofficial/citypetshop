"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
type PreviewRow = { name: string; price: number; description: string; categorySlug: string; image?: string; inStock: boolean };

const TEMPLATE_URL = "/templates/products_template.csv";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function parseRow(row: Record<string, string>, validSlugs: string[]): PreviewRow | null {
  const name = (row.name ?? row.Name ?? "").trim();
  const price = parseInt((row.price ?? row.Price ?? "0").trim(), 10);
  const categorySlug = (row.categoryslug ?? row.category_slug ?? row.categorySlug ?? "").trim();
  if (!name || Number.isNaN(price) || price < 0 || !categorySlug) return null;
  if (validSlugs.length === 0) return null;
  const slug = validSlugs.includes(categorySlug) ? categorySlug : validSlugs[0]!;
  return {
    name,
    price,
    description: (row.description ?? "").trim() || name,
    categorySlug: slug,
    image: (row.image ?? "").trim() || undefined,
    inStock: (row.instock ?? row.inStock ?? "true").trim().toLowerCase() !== "false",
  };
}

export default function AdminBulkProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [categories, setCategories] = useState<{ slug: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const validSlugs = categories.length > 0 ? categories.map((c) => c.slug) : [];

  const handleDownloadTemplate = useCallback(() => {
    window.open(TEMPLATE_URL, "_blank");
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setPreview([]);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      setFile(null);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const rows = parseCSV(text);
      const parsed: PreviewRow[] = [];
      for (const row of rows) {
        const p = parseRow(row, validSlugs);
        if (p) parsed.push(p);
      }
      setPreview(parsed);
      if (parsed.length === 0) setError("No valid rows found. Check CSV headers: name, price, description, categorySlug, image, inStock.");
    };
    reader.readAsText(f);
  }, [validSlugs]);

  const handleAddToCatalog = useCallback(async () => {
    setError(null);
    setSuccess(null);
    if (preview.length === 0) {
      setError("No rows to add. Upload a CSV first.");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: preview.map((p) => ({
            name: p.name,
            price: p.price,
            description: p.description,
            categorySlug: p.categorySlug,
            image: p.image,
            inStock: p.inStock,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }
      setSuccess(`Imported ${data.created} of ${data.total} product(s) to database.${data.errors?.length ? ` ${data.errors.length} row(s) had errors.` : ""}`);
      setPreview([]);
      setFile(null);
    } catch {
      setError("Import request failed");
    } finally {
      setImporting(false);
    }
  }, [preview]);

  const handleGoogleSheet = useCallback(() => {
    setError(null);
    setSuccess("Export your Google Sheet as CSV and upload above.");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Bulk Add Products</h1>
        <Link href="/admin/products" className="text-sm font-medium text-primary hover:underline">
          ← Back to Products
        </Link>
      </div>

      <p className="text-slate-600">
        Upload a CSV file or use the template below. Products will be imported into the database.
      </p>

      <div className="flex gap-2">
        <a
          href="/api/admin/products/export"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Download Template */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Download className="h-5 w-5" />
          CSV Template
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Download the template, fill in your products (name, price, description, categorySlug, image URL, inStock), and upload below.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Required columns: name, price, categorySlug. Optional: description, image, inStock. Valid slugs: {validSlugs.slice(0, 10).join(", ")}{validSlugs.length > 10 ? "…" : ""}
        </p>
        <a
          href={TEMPLATE_URL}
          download="products_template.csv"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Download Template
        </a>
      </div>

      {/* Upload CSV / Google Sheet */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Upload className="h-5 w-5" />
          Upload CSV or Connect Sheet
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Choose CSV File
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            type="button"
            onClick={handleGoogleSheet}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Google Sheet / Paste URL
          </button>
        </div>
        {file && <p className="mt-2 text-sm text-slate-600">File: {file.name}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Preview & Add */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Preview ({preview.length} rows)</h2>
          <div className="mt-4 max-h-64 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-2 font-medium">Name</th>
                  <th className="p-2 font-medium">Price (৳)</th>
                  <th className="p-2 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((p, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.price}</td>
                    <td className="p-2">{p.categorySlug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 20 && <p className="mt-2 text-xs text-slate-500">… and {preview.length - 20} more</p>}
          </div>
          <button
            type="button"
            onClick={handleAddToCatalog}
            disabled={importing}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {importing ? "Importing…" : `Import ${preview.length} product(s)`}
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <strong>Import:</strong> Products are saved to the database. Use valid category slugs from your catalog.
      </div>
    </div>
  );
}
