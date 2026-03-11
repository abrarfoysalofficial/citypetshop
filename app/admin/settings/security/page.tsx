"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AdminSecurityPage() {
  const { user } = useUser();

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Change Password</h1>
            <p className="text-sm text-slate-500">
              Password and account security are managed by Clerk.
            </p>
          </div>
        </div>

        {user?.primaryEmailAddress?.emailAddress && (
          <p className="mt-4 text-sm text-slate-600">
            Logged in as <span className="font-medium">{user.primaryEmailAddress.emailAddress}</span>
          </p>
        )}

        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Use the Clerk account security page to update your password and 2FA settings.
        </div>
        <Link
          href="/user-profile"
          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Open Account Security
        </Link>
      </div>
    </div>
  );
}
