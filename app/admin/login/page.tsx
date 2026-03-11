"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { sanitizeAdminCallbackUrl } from "@/lib/callback-url";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeAdminCallbackUrl(
    searchParams.get("callbackUrl") ?? searchParams.get("next"),
    typeof window !== "undefined" ? window.location.origin : undefined
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access the admin panel.
        </p>

        <div className="mt-6">
          <SignIn
            path="/admin/login"
            routing="path"
            fallbackRedirectUrl={callbackUrl}
            forceRedirectUrl={callbackUrl}
          />
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-slate-600 transition-colors hover:text-blue-600"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
