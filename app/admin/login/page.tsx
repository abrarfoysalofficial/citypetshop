"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

function isSafeAdminPath(path: string): boolean {
  return path === "/admin" || (path.startsWith("/admin/") && !path.includes(".."));
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        const errMsg = String(res.error ?? "").toLowerCase();
        const isConfigError =
          errMsg.includes("callback") ||
          errMsg.includes("invalid") ||
          errMsg.includes("url");
        setError(
          isConfigError
            ? "Server misconfiguration: NEXTAUTH_URL must match your site (e.g. https://citypetshop.bd). Set NEXTAUTH_URL and AUTH_TRUST_HOST=true in .env.production.local, then restart."
            : "Invalid email or password. Please try again or contact support."
        );
        setLoading(false);
        return;
      }
      const session = res?.ok;
      if (!session) {
        setError(
          "Sign in failed. Check: (1) NEXTAUTH_URL=https://citypetshop.bd in production, (2) admin credentials are seeded (default admin@citypetshop.bd)."
        );
        setLoading(false);
        return;
      }
      let target = "/admin";
      if (typeof callbackUrl === "string" && callbackUrl.trim()) {
        let path = callbackUrl.trim();
        if (!path.startsWith("/")) {
          try {
            path = new URL(callbackUrl).pathname;
          } catch {
            path = `/${callbackUrl}`;
          }
        }
        if (isSafeAdminPath(path)) target = path;
      }
      router.replace(target);
      router.refresh();
    } catch (err) {
      console.error("Admin login error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.toLowerCase().includes("callback") || msg.toLowerCase().includes("invalid")
          ? "Server misconfiguration: Set NEXTAUTH_URL=https://citypetshop.bd and AUTH_TRUST_HOST=true in production env, then restart."
          : "An error occurred. If login keeps failing, set NEXTAUTH_URL=https://citypetshop.bd on the server."
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access the admin panel.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            Dev default login: <strong>admin@citypetshop.bd</strong> / <strong>Admin@12345!</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="admin@citypetshop.bd"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

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
