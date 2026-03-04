import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; next?: string };
}) {
  // If NextAuth redirected here for admin access, send user to admin login
  const raw = searchParams?.callbackUrl ?? searchParams?.next;
  const callback = Array.isArray(raw) ? raw[0] : raw;
  if (typeof callback === "string") {
    try {
      const path = callback.startsWith("/") ? callback : new URL(callback).pathname;
      if (path === "/admin" || path.startsWith("/admin/")) {
        redirect(`/admin/login?callbackUrl=${encodeURIComponent(callback)}`);
      }
    } catch {
      // ignore invalid URLs
    }
  }

  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-4 w-64 animate-pulse rounded bg-slate-100" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
