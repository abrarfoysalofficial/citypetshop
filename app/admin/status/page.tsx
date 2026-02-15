import { getResolvedSources } from "@/src/services";
import {
  isSanityConfigured,
  isSupabaseConfigured,
  getSanityProjectId,
  getSanityDataset,
  getSiteUrl,
  getProductsSource,
  getAuthSource,
  getEnableFallbacks,
} from "@/src/config/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminStatusPage() {
  const sanityOk = isSanityConfigured();
  const supabaseOk = isSupabaseConfigured();
  const sources = getResolvedSources();
  const siteUrl = getSiteUrl();
  const productsSourceRaw = getProductsSource();
  const authSourceRaw = getAuthSource();
  const fallbacks = getEnableFallbacks();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Data sources &amp; status</h1>
      <p className="text-sm text-slate-600">
        Combined mode: Sanity (content), Supabase (auth/orders), Local (fallback). Admin works even when services are not configured.
      </p>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Configuration</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <span className="font-medium">Products source (raw):</span>{" "}
            <code className="rounded bg-slate-100 px-1">{productsSourceRaw}</code>
          </li>
          <li>
            <span className="font-medium">Auth source (raw):</span>{" "}
            <code className="rounded bg-slate-100 px-1">{authSourceRaw}</code>
          </li>
          <li>
            <span className="font-medium">Fallbacks enabled:</span>{" "}
            {fallbacks ? "Yes" : "No"}
          </li>
          {siteUrl && (
            <li>
              <span className="font-medium">Site URL:</span>{" "}
              <code className="rounded bg-slate-100 px-1">{siteUrl}</code>
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Sanity CMS</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            Status:{" "}
            {sanityOk ? (
              <span className="font-medium text-emerald-600">Configured</span>
            ) : (
              <span className="font-medium text-amber-600">Not configured</span>
            )}
          </li>
          {sanityOk && (
            <>
              <li>Project ID: <code className="rounded bg-slate-100 px-1">{getSanityProjectId()}</code></li>
              <li>Dataset: <code className="rounded bg-slate-100 px-1">{getSanityDataset()}</code></li>
            </>
          )}
        </ul>
        {!sanityOk && (
          <p className="mt-2 text-xs text-slate-500">
            Set NEXT_PUBLIC_SANITY_PROJECT_ID (and optionally NEXT_PUBLIC_SANITY_DATASET) to use Sanity for products/categories/home.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Supabase</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            Status:{" "}
            {supabaseOk ? (
              <span className="font-medium text-emerald-600">Configured</span>
            ) : (
              <span className="font-medium text-amber-600">Not configured</span>
            )}
          </li>
          {supabaseOk && <li>URL and anon key are set (not shown for security).</li>}
        </ul>
        {!supabaseOk && (
          <p className="mt-2 text-xs text-slate-500">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for auth and orders.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Resolved sources (current)</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li><span className="font-medium">Products:</span> <code className="rounded bg-slate-100 px-1">{sources.products}</code></li>
          <li><span className="font-medium">Auth:</span> <code className="rounded bg-slate-100 px-1">{sources.auth}</code></li>
          <li><span className="font-medium">Orders:</span> <code className="rounded bg-slate-100 px-1">{sources.orders}</code></li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Supabase orders persistence:{" "}
          {supabaseOk && sources.orders === "supabase" ? (
            <span className="font-medium text-emerald-600">Ready</span>
          ) : (
            <span className="text-amber-600">Not active</span>
          )}
        </p>
      </section>

      <p className="text-sm text-slate-500">
        <Link href="/admin" className="underline hover:no-underline">Back to dashboard</Link>
      </p>
    </div>
  );
}
