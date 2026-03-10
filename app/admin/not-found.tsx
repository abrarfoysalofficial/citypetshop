import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

/**
 * 404 page for unimplemented or invalid admin routes.
 * Shown when user navigates to a non-existent admin path.
 */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl bg-slate-100 p-6">
        <FileQuestion className="mx-auto h-16 w-16 text-slate-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600">
        This admin page doesn&apos;t exist or hasn&apos;t been implemented yet.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
