import { getSiteUrl, getDatabaseUrl } from "@/src/config/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminStatusPage() {
  const siteUrl = getSiteUrl();
  const dbUrl = getDatabaseUrl();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Status</h1>
        <Link
          href="/admin"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase text-slate-500">Database</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <span className="font-medium">Status:</span>{" "}
            <span className="font-medium text-emerald-600">PostgreSQL</span>
          </li>
          <li>
            <span className="font-medium">Connection:</span>{" "}
            <code className="rounded bg-slate-100 px-1">{dbUrl ? "Configured" : "Not configured"}</code>
          </li>
          {siteUrl && (
            <li>
              <span className="font-medium">Site URL:</span>{" "}
              <code className="rounded bg-slate-100 px-1">{siteUrl}</code>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
