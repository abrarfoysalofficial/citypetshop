"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, FileText, Loader2, ExternalLink } from "lucide-react";

type LegalPage = { slug: string; titleEn: string; id: string; isPublished: boolean };

const LEGAL_SLUGS = [
  { slug: "terms", label: "Terms & Conditions", path: "/terms" },
  { slug: "privacy", label: "Privacy Policy", path: "/privacy" },
  { slug: "refund", label: "Return & Refund Policy", path: "/refund" },
];

export default function AdminLegalPagesPage() {
  const [pages, setPages] = useState<Record<string, LegalPage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cms-pages")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, LegalPage> = {};
          for (const p of data as { id: string; slug: string; titleEn: string; isPublished: boolean }[]) {
            if (LEGAL_SLUGS.some((l) => l.slug === p.slug)) {
              map[p.slug] = { id: p.id, slug: p.slug, titleEn: p.titleEn, isPublished: p.isPublished };
            }
          }
          setPages(map);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Legal Pages</h1>
      <p className="text-slate-600">
        Edit Terms, Privacy, and Refund policy pages. Content is stored in CMS and displayed on the storefront. Run <code className="rounded bg-slate-100 px-1 py-0.5 text-sm">npx prisma db seed</code> to create default Bangla content if pages are missing.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {LEGAL_SLUGS.map(({ slug, label, path }) => {
          const page = pages[slug];
          return (
            <div
              key={slug}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-slate-900">{label}</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">/{slug}</p>
              <div className="mt-4 flex flex-1 flex-col gap-2">
                {page ? (
                  <>
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <a
                      href={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on site
                    </a>
                    <span className={`mt-2 rounded px-2 py-0.5 text-xs font-medium ${page.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {page.isPublished ? "Published" : "Draft"}
                    </span>
                  </>
                ) : (
                  <Link
                    href="/admin/pages/new"
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Create page (slug: {slug})
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-slate-500">
        <Link href="/admin/pages" className="text-blue-600 hover:underline">← Back to Site Pages</Link>
      </p>
    </div>
  );
}
